from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """User Management"""
    list_display = ('username', 'email', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('username',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('username', 'email', 'password')
        }),
        ('Permissions', {
            'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone', 'password1', 'password2', 'role'),
        }),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User Fitness Profile Management"""
    list_display = ('user', 'height', 'weight', 'fitness_goal', 'fitness_level', 'created_at')
    list_filter = ('fitness_goal', 'fitness_level', 'created_at')
    search_fields = ('user__username', 'user__email')
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'avatar')
        }),
        ('Physical Attributes', {
            'fields': ('height', 'weight', 'medical_conditions')
        }),
        ('Fitness Information', {
            'fields': ('fitness_goal', 'fitness_level', 'health_condition', 'notes')
        }),
         ('Contact Information', {
            'fields': ('emergency_contact',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',) 