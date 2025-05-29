from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """自定义用户管理"""
    list_display = ('username', 'email', 'phone', 'role', 'membership_type', 'membership_end', 'is_active')
    list_filter = ('role', 'membership_type', 'is_active', 'membership_end')
    search_fields = ('username', 'email', 'phone', 'member_id')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('个人信息'), {'fields': ('first_name', 'last_name', 'email', 'phone', 'avatar')}),
        (_('角色信息'), {'fields': ('role',)}),
        (_('会员信息'), {'fields': ('member_id', 'birth_date', 'gender', 'address')}),
        (_('会员卡信息'), {'fields': ('membership_type', 'membership_start', 'membership_end')}),
        (_('权限'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('重要日期'), {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone', 'password1', 'password2', 'role'),
        }),
    )
    ordering = ('-date_joined',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """用户健身档案管理"""
    list_display = ('user', 'height', 'weight', 'fitness_goal', 'fitness_level')
    list_filter = ('fitness_goal', 'fitness_level')
    search_fields = ('user__username', 'user__email', 'user__phone')
    readonly_fields = ('created_at', 'updated_at') 