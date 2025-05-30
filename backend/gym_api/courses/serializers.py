from rest_framework import serializers
from .models import CourseCategory, Course, CourseSchedule, CourseEnrollment
from gym_api.users.serializers import UserSerializer

class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    instructor_name = serializers.ReadOnlyField(source='instructor.get_full_name')
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'instructor', 'instructor_name', 'image', 'price', 'duration',
            'capacity', 'difficulty', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CourseScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.ReadOnlyField(source='course.name')
    course_instructor = serializers.ReadOnlyField(source='course.instructor.get_full_name')
    available_slots = serializers.SerializerMethodField()
    capacity = serializers.IntegerField(source='course.capacity', read_only=True)
    
    class Meta:
        model = CourseSchedule
        fields = [
            'id', 'course', 'course_name', 'course_instructor',
            'start_time', 'end_time', 'location', 'current_capacity',
            'capacity', 'available_slots', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_capacity', 'created_at', 'updated_at']
    
    def get_available_slots(self, obj):
        return obj.course.capacity - obj.current_capacity

class CourseDetailSerializer(serializers.ModelSerializer):
    category = CourseCategorySerializer(read_only=True)
    instructor = UserSerializer(read_only=True)
    schedules = CourseScheduleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'category', 'instructor',
            'image', 'price', 'duration', 'capacity', 'difficulty',
            'is_active', 'schedules', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    course_name = serializers.ReadOnlyField(source='schedule.course.name')
    schedule_time = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'user', 'user_name', 'schedule', 'course_name',
            'schedule_time', 'status', 'attendance', 'feedback',
            'rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_schedule_time(self, obj):
        return {
            'start': obj.schedule.start_time,
            'end': obj.schedule.end_time,
            'location': obj.schedule.location
        }
    
    def validate(self, data):
        """
        Check if the course is full
        """
        schedule = data.get('schedule')
        if schedule.current_capacity >= schedule.course.capacity:
            raise serializers.ValidationError('This course is full')
        return data
    
    def create(self, validated_data):
        """
        Create enrollment record and update course capacity
        """
        enrollment = super().create(validated_data)
        schedule = enrollment.schedule
        schedule.current_capacity += 1
        schedule.save()
        return enrollment 