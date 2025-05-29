from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Course, CourseCategory, CourseSchedule, CourseEnrollment

@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    """课程分类管理"""
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """课程管理"""
    list_display = ('name', 'category', 'instructor', 'price', 'capacity', 'duration', 'is_active')
    list_filter = ('category', 'is_active', 'instructor')
    search_fields = ('name', 'description', 'instructor__username')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {'fields': ('name', 'description', 'category', 'instructor')}),
        (_('课程信息'), {'fields': ('image', 'price', 'capacity', 'duration', 'difficulty')}),
        (_('状态'), {'fields': ('is_active',)}),
        (_('元数据'), {'fields': ('created_at', 'updated_at')}),
    )

@admin.register(CourseSchedule)
class CourseScheduleAdmin(admin.ModelAdmin):
    """课程排期管理"""
    list_display = ('course', 'start_time', 'end_time', 'location', 'current_capacity', 'capacity')
    list_filter = ('course', 'start_time', 'location')
    search_fields = ('course__name', 'location')
    readonly_fields = ('created_at', 'updated_at', 'current_capacity')
    
    def capacity(self, obj):
        return obj.course.capacity
    capacity.short_description = _('容量')

@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    """课程报名管理"""
    list_display = ('user', 'schedule', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'schedule__course__name')
    readonly_fields = ('created_at', 'updated_at')
    
    actions = ['approve_enrollments', 'reject_enrollments', 'mark_as_completed']
    
    def approve_enrollments(self, request, queryset):
        queryset.update(status='approved')
    approve_enrollments.short_description = _('批准选中的报名')
    
    def reject_enrollments(self, request, queryset):
        queryset.update(status='rejected')
    reject_enrollments.short_description = _('拒绝选中的报名')
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = _('标记为已完成') 