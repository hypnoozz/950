from django.urls import path
from .views import (
    MembershipPlanListCreateView,
    MembershipPlanDetailView,
    OrderListCreateView,
    OrderDetailView,
    CancelOrderView,
    # 管理员视图
    AdminMembershipPlanListView,
    AdminMembershipPlanCreateView,
    AdminMembershipPlanDetailView,
    AdminOrderListView,
    AdminOrderDetailView,
)

app_name = 'gym_orders'

urlpatterns = [
    # 会员套餐
    path('membership-plans/', MembershipPlanListCreateView.as_view(), name='membership-plan-list-create'),
    path('membership-plans/<int:pk>/', MembershipPlanDetailView.as_view(), name='membership-plan-detail'),
    
    # 订单
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    
    # 管理员会员套餐管理
    path('admin/membership-plans/', AdminMembershipPlanListView.as_view(), name='admin-membership-plan-list'),
    path('admin/membership-plans/create/', AdminMembershipPlanCreateView.as_view(), name='admin-membership-plan-create'),
    path('admin/membership-plans/<int:pk>/', AdminMembershipPlanDetailView.as_view(), name='admin-membership-plan-detail'),
    
    # 管理员订单管理
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
] 