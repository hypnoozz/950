from django.urls import path
from .views import (
    CourseCategoryListCreateView,
    CourseCategoryDetailView,
    CourseListCreateView,
    CourseDetailView,
    CourseScheduleListCreateView,
    CourseScheduleDetailView,
    CourseEnrollmentListCreateView,
    CourseEnrollmentDetailView,
    # 管理员视图
    AdminCourseListView,
    AdminCourseCreateView,
    AdminCourseDetailView,
    AdminCourseScheduleListView,
    AdminCourseScheduleCreateView,
    AdminCourseScheduleDetailView,
    # 管理员课程分类视图
    AdminCourseCategoryListView,
    AdminCourseCategoryCreateView,
    AdminCourseCategoryDetailView,
)

app_name = 'gym_courses'

urlpatterns = [
    # 课程分类
    path('categories/', CourseCategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CourseCategoryDetailView.as_view(), name='category-detail'),
    
    # 课程
    path('', CourseListCreateView.as_view(), name='course-list-create'),
    path('<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    
    # 课程排课
    path('schedules/', CourseScheduleListCreateView.as_view(), name='schedule-list-create'),
    path('schedules/<int:pk>/', CourseScheduleDetailView.as_view(), name='schedule-detail'),
    
    # 课程报名
    path('enrollments/', CourseEnrollmentListCreateView.as_view(), name='enrollment-list-create'),
    path('enrollments/<int:pk>/', CourseEnrollmentDetailView.as_view(), name='enrollment-detail'),
    
    # 管理员课程管理
    path('admin/courses/', AdminCourseListView.as_view(), name='admin-course-list'),
    path('admin/courses/create/', AdminCourseCreateView.as_view(), name='admin-course-create'),
    path('admin/courses/<int:pk>/', AdminCourseDetailView.as_view(), name='admin-course-detail'),
    
    # 管理员课程分类管理
    path('admin/categories/', AdminCourseCategoryListView.as_view(), name='admin-category-list'),
    path('admin/categories/create/', AdminCourseCategoryCreateView.as_view(), name='admin-category-create'),
    path('admin/categories/<int:pk>/', AdminCourseCategoryDetailView.as_view(), name='admin-category-detail'),
    
    # 管理员课程排课管理
    path('admin/schedules/', AdminCourseScheduleListView.as_view(), name='admin-schedule-list'),
    path('admin/schedules/create/', AdminCourseScheduleCreateView.as_view(), name='admin-schedule-create'),
    path('admin/schedules/<int:pk>/', AdminCourseScheduleDetailView.as_view(), name='admin-schedule-detail'),
] 