from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Course, CourseCategory, CourseSchedule, CourseEnrollment

@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    """Course Category Management"""
    list_display = ('name', 'description', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')
    ordering = ('name',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Course Management"""
    list_display = ('name', 'category', 'instructor', 'price', 'difficulty', 'created_at')
    list_filter = ('category', 'difficulty', 'created_at')
    search_fields = ('name', 'description', 'instructor__username')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'instructor', 'description', 'price', 'difficulty')
        }),
        ('Media', {
            'fields': ('cover_image', 'video_url')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

@admin.register(CourseSchedule)
class CourseScheduleAdmin(admin.ModelAdmin):
    """Course Schedule Management"""
    list_display = ('course', 'start_time', 'end_time', 'location', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('course__name', 'location')
    date_hierarchy = 'start_time'
    fieldsets = (
        ('Course Information', {
            'fields': ('course', 'start_time', 'end_time', 'location')
        }),
    )

@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    """Course Enrollment Management"""
    list_display = ('user', 'schedule', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'schedule__course__name')
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('user', 'schedule', 'status')
        }),
    ) 