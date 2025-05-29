from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from .models import CourseCategory, Course, CourseSchedule, CourseEnrollment
from .serializers import (
    CourseCategorySerializer,
    CourseSerializer,
    CourseDetailSerializer,
    CourseScheduleSerializer,
    CourseEnrollmentSerializer,
)
from gym_api.auth.permissions import IsAdminUserOrReadOnly, IsOwnerOrAdmin, IsStaffOrAdmin, IsAdmin

# 课程分类视图
class CourseCategoryListCreateView(generics.ListCreateAPIView):
    """
    课程分类列表和创建视图
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class CourseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    课程分类详情、更新和删除视图
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]

# 管理员课程分类管理视图
class AdminCourseCategoryListView(generics.ListAPIView):
    """
    管理员课程分类列表视图
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class AdminCourseCategoryCreateView(generics.CreateAPIView):
    """
    管理员创建课程分类视图
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdmin]

class AdminCourseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    管理员课程分类详情、更新和删除视图
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdmin]

# 课程视图
class CourseListCreateView(generics.ListCreateAPIView):
    """
    课程列表和创建视图
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'instructor', 'difficulty', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    
    def get_permissions(self):
        """
        GET方法允许所有用户访问
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_queryset(self):
        """
        非员工/管理员只能查看激活的课程
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated and user.role in ['staff', 'admin']:
            return queryset
        
        return queryset.filter(is_active=True)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    课程详情、更新和删除视图
    """
    queryset = Course.objects.all()
    permission_classes = [IsStaffOrAdmin]
    
    def get_serializer_class(self):
        """
        GET方法使用详细序列化器
        """
        if self.request.method == 'GET':
            return CourseDetailSerializer
        return CourseSerializer
    
    def get_permissions(self):
        """
        GET方法允许所有用户访问
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()

# 管理员课程管理视图
class AdminCourseListView(generics.ListAPIView):
    """
    管理员课程列表视图
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'instructor', 'difficulty', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']

class AdminCourseCreateView(generics.CreateAPIView):
    """
    管理员创建课程视图
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]

class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    管理员课程详情、更新和删除视图
    """
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAdmin]
    
    def get_serializer_class(self):
        """
        GET方法使用详细序列化器
        """
        if self.request.method == 'GET':
            return CourseDetailSerializer
        return CourseSerializer

# 课程排课视图
class CourseScheduleListCreateView(generics.ListCreateAPIView):
    """
    课程排课列表和创建视图
    """
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course']
    ordering_fields = ['start_time', 'created_at']
    
    def get_queryset(self):
        """
        可根据课程ID过滤排课
        """
        queryset = CourseSchedule.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def get_permissions(self):
        """
        GET方法允许所有用户访问
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()

class CourseScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    课程排课详情、更新和删除视图
    """
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsStaffOrAdmin]
    
    def get_permissions(self):
        """
        GET方法允许所有用户访问
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()

# 管理员课程排课管理视图
class AdminCourseScheduleListView(generics.ListAPIView):
    """
    管理员课程排课列表视图
    """
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course']
    ordering_fields = ['start_time', 'created_at']
    
    def get_queryset(self):
        """
        可根据课程ID过滤排课
        """
        queryset = CourseSchedule.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

class AdminCourseScheduleCreateView(generics.CreateAPIView):
    """
    管理员创建课程排课视图
    """
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAdmin]

class AdminCourseScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    管理员课程排课详情、更新和删除视图
    """
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAdmin]

# 课程报名视图
class CourseEnrollmentListCreateView(generics.ListCreateAPIView):
    """
    课程报名列表和创建视图
    """
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'schedule', 'status']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """
        管理员可查看所有报名记录
        普通用户只能查看自己的报名记录
        """
        user = self.request.user
        if user.role == 'admin':
            return CourseEnrollment.objects.all()
        elif user.role == 'staff':
            # 教练可以查看自己教授的课程的报名记录
            return CourseEnrollment.objects.filter(schedule__course__instructor=user)
        else:
            return CourseEnrollment.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """
        设置当前用户为报名用户
        """
        # 如果已经报名过该课程，则不允许重复报名
        schedule = serializer.validated_data.get('schedule')
        if CourseEnrollment.objects.filter(user=self.request.user, schedule=schedule).exists():
            raise ValidationError('您已经报名过该课程')
        
        serializer.save(user=self.request.user)

class CourseEnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    课程报名详情、更新和删除视图
    """
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        """
        管理员可查看所有报名记录
        普通用户只能查看自己的报名记录
        """
        user = self.request.user
        if user.role == 'admin':
            return CourseEnrollment.objects.all()
        elif user.role == 'staff':
            # 教练可以查看/更新自己教授的课程的报名记录
            return CourseEnrollment.objects.filter(schedule__course__instructor=user)
        else:
            return CourseEnrollment.objects.filter(user=user)
    
    def perform_update(self, serializer):
        """
        更新报名状态
        """
        # 当用户取消报名时，减少当前容量
        old_status = self.get_object().status
        new_status = serializer.validated_data.get('status', old_status)
        
        if old_status == 'enrolled' and new_status == 'cancelled':
            schedule = self.get_object().schedule
            schedule.current_capacity -= 1
            schedule.save()
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        删除报名记录时，减少当前容量
        """
        if instance.status == 'enrolled':
            schedule = instance.schedule
            schedule.current_capacity -= 1
            schedule.save()
        
        instance.delete() 