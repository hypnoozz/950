from rest_framework import generics, status, permissions, filters, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import CourseCategory, Course, CourseSchedule, CourseEnrollment
from .serializers import (
    CourseCategorySerializer,
    CourseSerializer,
    CourseDetailSerializer,
    CourseScheduleSerializer,
    CourseEnrollmentSerializer,
)
from gym_api.auth.permissions import IsAdminUserOrReadOnly, IsOwnerOrAdmin, IsStaffOrAdmin, IsAdmin
from gym_api.orders.models import Order, OrderItem

# Course Category Views
class CourseCategoryListCreateView(generics.ListCreateAPIView):
    """
    Course Category List and Create View
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class CourseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Course Category Detail, Update and Delete View
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdminUserOrReadOnly]

# Admin Course Category Management Views
class AdminCourseCategoryListView(generics.ListAPIView):
    """
    Admin Course Category List View
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

class AdminCourseCategoryCreateView(generics.CreateAPIView):
    """
    Admin Create Course Category View
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdmin]

class AdminCourseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin Course Category Detail, Update and Delete View
    """
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAdmin]

# Course Views
class CourseListCreateView(generics.ListCreateAPIView):
    """
    Course List and Create View
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
        GET method allows all users to access
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    def get_queryset(self):
        """
        Non-staff/admin users can only view active courses
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.is_authenticated and user.role in ['staff', 'admin']:
            return queryset
        
        return queryset.filter(is_active=True)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Course Detail, Update and Delete View
    """
    queryset = Course.objects.all()
    permission_classes = [IsStaffOrAdmin]
    
    def get_serializer_class(self):
        """
        GET method uses detailed serializer
        """
        if self.request.method == 'GET':
            return CourseDetailSerializer
        return CourseSerializer
    
    def get_permissions(self):
        """
        GET method allows all users to access
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()

# Admin Course Management Views
class AdminCourseListView(generics.ListAPIView):
    """
    Admin Course List View
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
    Admin Create Course View
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]

class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin Course Detail, Update and Delete View
    """
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAdmin]
    
    def get_serializer_class(self):
        """
        GET method uses detailed serializer
        """
        if self.request.method == 'GET':
            return CourseDetailSerializer
        return CourseSerializer

# Course Schedule Views
class CourseScheduleListCreateView(generics.ListCreateAPIView):
    """
    Course Schedule List and Create View
    """
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course']
    ordering_fields = ['start_time', 'created_at']
    
    def get_queryset(self):
        """
        Can filter schedules by course ID
        """
        queryset = CourseSchedule.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def get_permissions(self):
        """
        GET method allows all users to access
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()

class CourseScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Course Schedule Detail, Update and Delete View
    """
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsStaffOrAdmin]
    
    def get_permissions(self):
        """
        GET method allows all users to access
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return super().get_permissions()

# Admin Course Schedule Management Views
class AdminCourseScheduleListView(generics.ListAPIView):
    """
    Admin Course Schedule List View
    """
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course']
    ordering_fields = ['start_time', 'created_at']
    
    def get_queryset(self):
        """
        Can filter schedules by course ID
        """
        queryset = CourseSchedule.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

class AdminCourseScheduleCreateView(generics.CreateAPIView):
    """
    Admin Create Course Schedule View
    """
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAdmin]

class AdminCourseScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin Course Schedule Detail, Update and Delete View
    """
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAdmin]

# Course Enrollment Views
class CourseEnrollmentListCreateView(generics.ListCreateAPIView):
    """
    Course Enrollment List and Create View
    """
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['user', 'schedule', 'status']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        """
        Users can only view their own enrollments
        """
        user = self.request.user
        if user.role in ['staff', 'admin']:
            return CourseEnrollment.objects.all()
        return CourseEnrollment.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """
        Create enrollment and update course capacity
        """
        enrollment = serializer.save(user=self.request.user)
        schedule = enrollment.schedule
        schedule.current_capacity += 1
        schedule.save()
        return enrollment

class CourseEnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Course Enrollment Detail, Update and Delete View
    """
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        """
        Users can only view their own enrollments
        """
        user = self.request.user
        if user.role in ['staff', 'admin']:
            return CourseEnrollment.objects.all()
        return CourseEnrollment.objects.filter(user=user)
    
    def perform_update(self, serializer):
        """
        Update enrollment and handle course capacity
        """
        old_status = self.get_object().status
        new_status = serializer.validated_data.get('status', old_status)
        
        enrollment = serializer.save()
        
        # If status changed from enrolled to cancelled
        if old_status == 'enrolled' and new_status == 'cancelled':
            schedule = enrollment.schedule
            schedule.current_capacity -= 1
            schedule.save()
        
        return enrollment
    
    def perform_destroy(self, instance):
        """
        Delete enrollment and update course capacity
        """
        if instance.status == 'enrolled':
            schedule = instance.schedule
            schedule.current_capacity -= 1
            schedule.save()
        instance.delete()

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Course.objects.all()
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__name=category)
        return queryset

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        course = self.get_object()
        schedule_id = request.data.get('schedule_id')
        
        if not schedule_id:
            return Response(
                {'message': 'Schedule ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            schedule = CourseSchedule.objects.get(id=schedule_id, course=course)
        except CourseSchedule.DoesNotExist:
            return Response(
                {'message': 'Invalid schedule'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user has active membership
        if not request.user.has_active_membership():
            return Response(
                {'message': 'Active membership required to enroll in courses'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if schedule is full
        if schedule.current_capacity >= schedule.course.capacity:
            return Response(
                {'message': 'Schedule is full'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user is already enrolled
        if schedule.enrollments.filter(user=request.user).exists():
            return Response(
                {'message': 'Already enrolled in this schedule'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create order for course enrollment
        order = Order.objects.create(
            user=request.user,
            order_number=f'COURSE-{timezone.now().strftime("%Y%m%d%H%M%S")}',
            total_amount=course.price,
            status='paid',
            payment_method='credit_card'
        )

        # Create order item
        OrderItem.objects.create(
            order=order,
            item_type='course',
            item_id=course.id,
            quantity=1,
            price=course.price
        )

        # Update schedule capacity
        schedule.current_capacity += 1
        schedule.save()

        # Add user to schedule enrollments
        schedule.enrollments.add(request.user)

        return Response(
            {'message': 'Successfully enrolled in course'},
            status=status.HTTP_200_OK
        )

class CourseCategoryViewSet(viewsets.ModelViewSet):
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAuthenticated]

class CourseScheduleViewSet(viewsets.ModelViewSet):
    queryset = CourseSchedule.objects.all()
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CourseSchedule.objects.all()
        course_id = self.request.query_params.get('course_id', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset 