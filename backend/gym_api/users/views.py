from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import User, UserProfile
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    UserMembershipSerializer,
    UserMembershipUpdateSerializer
)
from gym_api.auth.permissions import IsAdminUserOrReadOnly, IsOwnerOrAdmin, IsAdmin
from gym_api.orders.models import MembershipPlan
from django.utils import timezone
import datetime

class UserListCreateView(generics.ListCreateAPIView):
    """
    用户列表和创建视图
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]  # 使用 Django 自带的 IsAdminUser 权限类
    
    def get_queryset(self):
        """
        根据查询参数过滤用户
        支持按角色筛选(role)或排除角色(exclude_roles)
        """
        queryset = User.objects.all()
        
        # 按角色筛选
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        
        # 排除角色(支持多个角色，用逗号分隔)
        exclude_roles = self.request.query_params.get('exclude_roles', None)
        if exclude_roles:
            roles_list = exclude_roles.split(',')
            query = Q()
            for r in roles_list:
                query |= Q(role=r.strip())
            queryset = queryset.exclude(query)
        
        # 搜索功能
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search)
            )
            
        return queryset.order_by('-date_joined')  # 添加排序以避免分页警告

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    用户详情、更新和删除视图
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrAdmin]

# 管理员教练管理视图
class InstructorListView(generics.ListAPIView):
    """
    教练列表视图
    """
    queryset = User.objects.filter(role='staff')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        """
        过滤教练用户，可搜索
        """
        queryset = User.objects.filter(role='staff')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(username__icontains=search)
        return queryset

class InstructorCreateView(generics.CreateAPIView):
    """
    创建教练视图
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def perform_create(self, serializer):
        """
        创建教练，确保角色为staff
        """
        serializer.save(role='staff')

class InstructorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    教练详情、更新和删除视图
    """
    queryset = User.objects.filter(role='staff')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def perform_update(self, serializer):
        """
        确保更新时保持教练角色
        """
        serializer.save(role='staff')

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    用户健身档案视图
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        profile = get_object_or_404(UserProfile, user_id=user_id)
        self.check_object_permissions(self.request, profile.user)
        return profile
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserProfileUpdateSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # 返回更新后的完整数据
        response_serializer = UserProfileSerializer(instance)
        return Response(response_serializer.data)

class ChangePasswordView(APIView):
    """
    修改密码视图
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            # 检查旧密码
            if not request.user.check_password(serializer.data.get('old_password')):
                return Response({'old_password': ['密码不正确']}, status=status.HTTP_400_BAD_REQUEST)
            
            # 设置新密码
            request.user.set_password(serializer.data.get('new_password'))
            request.user.save()
            return Response({'message': '密码已成功修改'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    """
    获取当前登录用户信息
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserMembershipView(APIView):
    """
    用户会员信息视图
    - GET: 获取当前用户会员信息
    - 需要认证
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_membership_plan(self, plan_id):
        """获取会员套餐信息"""
        try:
            return MembershipPlan.objects.get(id=plan_id)
        except MembershipPlan.DoesNotExist:
            return None
    
    def get(self, request):
        """获取当前用户会员信息"""
        user = request.user
        
        # 获取关联的会员套餐
        if user.membership_plan_id:
            membership_plan = self.get_membership_plan(user.membership_plan_id)
            setattr(user, 'membership_plan', membership_plan)
        else:
            setattr(user, 'membership_plan', None)
        
        # 检查会员是否过期
        if user.membership_end and user.membership_end < timezone.now().date():
            if user.membership_status == 'active':
                user.membership_status = 'expired'
                user.save(update_fields=['membership_status'])
        
        serializer = UserMembershipSerializer(user)
        return Response(serializer.data)

class AdminUserMembershipView(generics.RetrieveUpdateAPIView):
    """
    管理员用户会员信息视图
    - GET: 获取指定用户会员信息
    - PUT/PATCH: 更新指定用户会员信息
    - 需要管理员权限
    """
    serializer_class = UserMembershipSerializer
    permission_classes = [IsAdmin]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')
        return get_object_or_404(User, id=user_id)
    
    def get_membership_plan(self, plan_id):
        """获取会员套餐信息"""
        try:
            return MembershipPlan.objects.get(id=plan_id)
        except MembershipPlan.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        
        # 获取关联的会员套餐
        if user.membership_plan_id:
            membership_plan = self.get_membership_plan(user.membership_plan_id)
            setattr(user, 'membership_plan', membership_plan)
        else:
            setattr(user, 'membership_plan', None)
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user = self.get_object()
        
        serializer = UserMembershipUpdateSerializer(user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # 获取更新后的对象并设置会员套餐信息
        if user.membership_plan_id:
            membership_plan = self.get_membership_plan(user.membership_plan_id)
            setattr(user, 'membership_plan', membership_plan)
        else:
            setattr(user, 'membership_plan', None)
            
        result_serializer = UserMembershipSerializer(user)
        return Response(result_serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()

class CreateUserMembershipView(APIView):
    """
    创建/更新用户会员信息视图
    - POST: 创建或更新用户会员信息
    - 此API主要用于订单支付成功后的会员信息更新
    - 需要管理员权限或特殊内部调用
    """
    permission_classes = [IsAdmin]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        plan_id = request.data.get('plan_id')
        
        if not user_id or not plan_id:
            return Response(
                {'error': '用户ID和套餐ID是必需的'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': '用户不存在'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            plan = MembershipPlan.objects.get(id=plan_id)
        except MembershipPlan.DoesNotExist:
            return Response(
                {'error': '会员套餐不存在'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 设置会员有效期
        start_date = timezone.now().date()
        end_date = start_date + datetime.timedelta(days=plan.duration)
        
        # 更新用户会员信息
        user.membership_start = start_date
        user.membership_end = end_date
        user.membership_type = plan.plan_type
        user.membership_status = 'active'
        user.membership_plan_id = plan.id
        user.membership_plan_name = plan.name
        user.role = 'member'  # 更新用户角色为会员
        
        # 生成会员卡号（如果没有）
        if not user.member_id:
            user.member_id = f"M{user.id:06d}"
            
        user.save()
        
        # 返回更新后的会员信息
        setattr(user, 'membership_plan', plan)
        serializer = UserMembershipSerializer(user)
        return Response(serializer.data) 