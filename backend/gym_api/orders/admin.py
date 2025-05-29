from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import MembershipPlan, Order, OrderItem

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    """会员套餐管理"""
    list_display = ('name', 'price', 'duration', 'is_active')
    list_filter = ('is_active', 'plan_type')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('name', 'description', 'plan_type', 'duration', 'price')}),
        (_('状态'), {'fields': ('is_active',)}),
        (_('元数据'), {'fields': ('created_at', 'updated_at')}),
    )

class OrderItemInline(admin.TabularInline):
    """订单项内联编辑"""
    model = OrderItem
    extra = 0
    readonly_fields = ('item_total',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """订单管理"""
    list_display = ('id', 'user', 'total_amount', 'status', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('id', 'user__username', 'user__phone')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at', 'total_amount')
    fieldsets = (
        (None, {'fields': ('user', 'status', 'payment_method')}),
        (_('支付信息'), {'fields': ('total_amount', 'transaction_id')}),
        (_('地址信息'), {'fields': ('address', 'contact_phone')}),
        (_('备注'), {'fields': ('note',)}),
        (_('元数据'), {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['mark_as_paid', 'mark_as_delivered', 'mark_as_completed', 'mark_as_refunded']
    
    def mark_as_paid(self, request, queryset):
        queryset.update(status='paid')
    mark_as_paid.short_description = _('标记为已支付')
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = _('标记为已交付')
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = _('标记为已完成')
    
    def mark_as_refunded(self, request, queryset):
        queryset.update(status='refunded')
    mark_as_refunded.short_description = _('标记为已退款') 