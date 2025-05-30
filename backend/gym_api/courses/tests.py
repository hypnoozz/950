from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import Course, CourseCategory, CourseSchedule, CourseEnrollment
from gym_api.users.models import User
from gym_api.utils.test_report import TestReport
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseModelTests(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123',
            role='staff'
        )
        self.category = CourseCategory.objects.create(
            name='Yoga',
            description='Yoga classes'
        )
        self.course = Course.objects.create(
            name='Basic Yoga',
            description='Introduction to yoga',
            category=self.category,
            instructor=self.instructor,
            price=49.99,
            duration=60,
            capacity=20,
            difficulty='beginner'
        )
        self.schedule = CourseSchedule.objects.create(
            course=self.course,
            start_time='2024-03-20T10:00:00Z',
            end_time='2024-03-20T11:00:00Z',
            location='Studio 1'
        )

    def test_course_creation(self):
        self.assertEqual(self.course.name, 'Basic Yoga')
        self.assertEqual(self.course.instructor, self.instructor)
        self.assertEqual(self.course.category, self.category)
        self.assertEqual(self.course.price, 49.99)

    def test_schedule_creation(self):
        self.assertEqual(self.schedule.course, self.course)
        self.assertEqual(self.schedule.location, 'Studio 1')
        self.assertEqual(self.schedule.current_capacity, 0)

class CourseAPITests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='instructor',
            email='instructor@example.com',
            password='testpass123',
            role='staff'
        )
        self.category = CourseCategory.objects.create(
            name='Yoga',
            description='Yoga classes'
        )
        self.course = Course.objects.create(
            name='Basic Yoga',
            description='Introduction to yoga',
            category=self.category,
            instructor=self.instructor,
            price=49.99,
            duration=60,
            capacity=20,
            difficulty='beginner'
        )
        self.client.force_authenticate(user=self.instructor)

    def test_course_list(self):
        url = '/api/courses/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)

    def test_course_detail(self):
        url = f'/api/courses/{self.course.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Basic Yoga')