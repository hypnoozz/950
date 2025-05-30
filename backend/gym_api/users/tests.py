from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import User, UserProfile
from gym_api.utils.test_report import TestReport
from django.contrib.auth import get_user_model

User = get_user_model()

# 创建单个共享的 TestReport 实例
shared_report = TestReport()

class UserTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shared_report.save_report('test/test_reports/backend_test.txt')

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)
        self.user_detail_url = reverse('gym_users:user-detail', args=[self.user.id])
        self.profile_url = reverse('gym_users:user-profile', args=[self.user.id])

    def test_user_detail(self):
        """Test retrieving user detail"""
        response = self.client.get(self.user_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        shared_report.add_test_result('test_user_detail', 'PASS' if response.status_code == status.HTTP_200_OK else 'FAIL')

class UserAuthenticationTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shared_report.save_report('test/test_reports/backend_test.txt')

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_valid_login(self):
        """Test valid login credentials"""
        url = '/api/auth/login/'
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        shared_report.add_test_result('test_valid_login', 'PASS' if response.status_code == status.HTTP_200_OK else 'FAIL')

    def test_invalid_password(self):
        """Test invalid password"""
        url = '/api/auth/login/'
        data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        shared_report.add_test_result('test_invalid_password', 'PASS' if response.status_code == status.HTTP_401_UNAUTHORIZED else 'FAIL')

    def test_user_registration(self):
        """Test user registration"""
        url = '/api/auth/register/'
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        shared_report.add_test_result('test_user_registration', 'PASS' if response.status_code == status.HTTP_201_CREATED else 'FAIL')

class UserAPITests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shared_report.save_report('test/test_reports/backend_test.txt')

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_user_registration(self):
        url = '/api/auth/register/'
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        shared_report.add_test_result('test_user_registration_api', 'PASS' if response.status_code == status.HTTP_201_CREATED else 'FAIL')

    def test_user_login(self):
        url = '/api/auth/login/'
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        shared_report.add_test_result('test_user_login_api', 'PASS' if response.status_code == status.HTTP_200_OK else 'FAIL') 