from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import MembershipPlan, Order, OrderItem

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    """Membership Plan Management"""
    list_display = ('name', 'plan_type', 'price', 'duration', 'is_active', 'created_at')
    list_filter = ('is_active', 'plan_type', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('name', 'description', 'plan_type', 'duration', 'price')}),
        ('Benefits', {'fields': ('benefits',)}),
        ('Status', {'fields': ('is_active',)}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)

class OrderItemInline(admin.TabularInline):
    """Order Item Inline Editing"""
    model = OrderItem
    extra = 0
    readonly_fields = ('item_total',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Order Management"""
    list_display = ('id', 'user', 'total_amount', 'status', 'payment_method', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('id', 'user__username', 'user__email')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('user', 'status', 'payment_method')}),
        ('Payment', {'fields': ('total_amount',)}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )
    ordering = ('-created_at',)
    
    actions = ['mark_as_paid', 'mark_as_delivered', 'mark_as_completed', 'mark_as_refunded']
    
    def mark_as_paid(self, request, queryset):
        queryset.update(status='paid')
    mark_as_paid.short_description = 'Mark selected orders as paid'
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = 'Mark selected orders as delivered'
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = 'Mark selected orders as completed'
    
    def mark_as_refunded(self, request, queryset):
        queryset.update(status='refunded')
    mark_as_refunded.short_description = 'Mark selected orders as refunded'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Order Item Management"""
    list_display = ('order', 'item_type', 'item_id', 'price', 'quantity', 'created_at')
    list_filter = ('item_type', 'created_at')
    search_fields = ('order__id', 'item_id')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('order', 'item_type', 'item_id')}),
        ('Details', {'fields': ('price', 'quantity')}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )
    ordering = ('-created_at',) 