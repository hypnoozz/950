from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import MembershipPlan, Order, OrderItem
from .serializers import (
    MembershipPlanSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer,
)
from gym_api.auth.permissions import IsAdminUserOrReadOnly, IsOwnerOrAdmin, IsStaffOrAdmin, IsAdmin
import requests

# 会员套餐视图
class MembershipPlanListCreateView(generics.ListCreateAPIView):
    """
    会员套餐列表和创建视图
    """
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'duration', 'created_at']
    
    def get_queryset(self):
        """
        非员工/管理员只能查看激活的套餐
        """
        queryset = super().get_queryset()
        if self.request.method == 'GET':
            user = self.request.user
            
            if not user.is_authenticated or user.role not in ['staff', 'admin']:
                queryset = queryset.filter(is_active=True)
                
        return queryset

class MembershipPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    会员套餐详情、更新和删除视图
    """
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdminUserOrReadOnly]

# 管理员会员套餐管理视图
class AdminMembershipPlanListView(generics.ListAPIView):
    """
    管理员会员套餐列表视图
    """
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'duration', 'created_at']

class AdminMembershipPlanCreateView(generics.CreateAPIView):
    """
    管理员创建会员套餐视图
    """
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdmin]

class AdminMembershipPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    管理员会员套餐详情、更新和删除视图
    """
    queryset = MembershipPlan.objects.all()
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAdmin]

# 订单视图
class OrderListCreateView(generics.ListCreateAPIView):
    """
    订单列表和创建视图
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'order_type']
    ordering_fields = ['created_at', 'paid_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_queryset(self):
        """
        管理员可查看所有订单
        普通用户只能查看自己的订单
        """
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        elif user.role == 'staff':
            # 员工可以查看所有订单，但可能需要限制某些敏感信息
            return Order.objects.all()
        else:
            return Order.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """
        创建订单时自动关联当前用户
        """
        try:
            # 将当前用户关联到订单
            order = serializer.save(user=self.request.user)
            print(f"订单创建成功: ID={order.id}, 用户={self.request.user.username}, 金额={order.actual_amount}")
            
            # 如果订单状态为已支付，立即更新用户会员信息
            if order.status == 'paid' and order.order_type == 'membership':
                self.update_user_membership(order)
        except Exception as e:
            print(f"订单创建失败: {str(e)}")
            raise ValidationError(f"订单创建失败: {str(e)}")
    
    def update_user_membership(self, order):
        """
        当支付会员套餐订单时，更新用户会员信息
        """
        if order.order_type == 'membership':
            # 获取订单中的会员套餐信息
            membership_items = order.items.filter(membership_plan__isnull=False)
            
            if membership_items.exists():
                membership_item = membership_items.first()
                plan_id = membership_item.membership_plan.id
                user_id = order.user.id
                
                # 调用会员信息更新接口
                try:
                    # 本地调用方式
                    from gym_api.users.views import CreateUserMembershipView
                    request_data = {
                        'user_id': user_id,
                        'plan_id': plan_id
                    }
                    view = CreateUserMembershipView()
                    view.post(request=self.request._request, data=request_data)
                    print(f"用户会员信息更新成功: 用户ID={user_id}, 套餐ID={plan_id}")
                except Exception as e:
                    # 记录错误但不中断流程
                    print(f"更新用户会员信息失败: {str(e)}")

class OrderDetailView(generics.RetrieveUpdateAPIView):
    """
    订单详情和更新视图
    """
    permission_classes = [IsOwnerOrAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return OrderUpdateSerializer
        return OrderSerializer
    
    def get_queryset(self):
        """
        管理员可查看所有订单
        普通用户只能查看自己的订单
        """
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        elif user.role == 'staff':
            return Order.objects.all()
        else:
            return Order.objects.filter(user=user)
    
    def perform_update(self, serializer):
        """
        更新订单状态
        """
        instance = self.get_object()
        old_status = instance.status
        
        # 保存更新
        order = serializer.save()
        
        # 如果订单状态从待支付变为已支付，更新用户会员信息
        if old_status == 'pending' and order.status == 'paid':
            self.update_user_membership(order)
    
    def update_user_membership(self, order):
        """
        当支付会员套餐订单时，更新用户会员信息
        """
        if order.order_type == 'membership':
            # 获取订单中的会员套餐信息
            membership_items = order.items.filter(membership_plan__isnull=False)
            
            if membership_items.exists():
                membership_item = membership_items.first()
                plan_id = membership_item.membership_plan.id
                user_id = order.user.id
                
                # 调用会员信息更新接口
                try:
                    # 本地调用方式
                    from gym_api.users.views import CreateUserMembershipView
                    request_data = {
                        'user_id': user_id,
                        'plan_id': plan_id
                    }
                    view = CreateUserMembershipView()
                    view.post(request=self.request._request, data=request_data)
                except Exception as e:
                    # 记录错误但不中断流程
                    print(f"更新用户会员信息失败: {str(e)}")

# 管理员订单管理视图
class AdminOrderListView(generics.ListAPIView):
    """
    管理员订单列表视图
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'order_type', 'payment_method']
    search_fields = ['order_id', 'user__username']
    ordering_fields = ['created_at', 'paid_at', 'total_amount']

class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    """
    管理员订单详情和更新视图
    """
    queryset = Order.objects.all()
    permission_classes = [IsAdmin]
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return OrderUpdateSerializer
        return OrderSerializer
    
    def perform_update(self, serializer):
        """
        更新订单状态
        """
        instance = self.get_object()
        old_status = instance.status
        
        # 保存更新
        order = serializer.save()
        
        # 如果订单状态从待支付变为已支付，更新用户会员信息
        if old_status == 'pending' and order.status == 'paid':
            self.update_user_membership(order)
    
    def update_user_membership(self, order):
        """
        当支付会员套餐订单时，更新用户会员信息
        """
        if order.order_type == 'membership':
            # 获取订单中的会员套餐信息
            membership_items = order.items.filter(membership_plan__isnull=False)
            
            if membership_items.exists():
                membership_item = membership_items.first()
                plan_id = membership_item.membership_plan.id
                user_id = order.user.id
                
                # 调用会员信息更新接口
                try:
                    # 本地调用方式
                    from gym_api.users.views import CreateUserMembershipView
                    request_data = {
                        'user_id': user_id,
                        'plan_id': plan_id
                    }
                    view = CreateUserMembershipView()
                    view.post(request=self.request._request, data=request_data)
                except Exception as e:
                    # 记录错误但不中断流程
                    print(f"更新用户会员信息失败: {str(e)}")

class CancelOrderView(generics.UpdateAPIView):
    """
    取消订单视图
    """
    permission_classes = [IsOwnerOrAdmin]
    serializer_class = OrderUpdateSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=user)
    
    def update(self, request, *args, **kwargs):
        """
        取消订单
        """
        order = self.get_object()
        
        # 只有待支付的订单才能取消
        if order.status != 'pending':
            return Response(
                {'error': '只有待支付的订单才能取消'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 更新订单状态为已取消
        order.status = 'cancelled'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data) 