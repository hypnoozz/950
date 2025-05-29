from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from gym_api.users.models import User
from ..utils.test_report import TestReport

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.report = TestReport()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        self.login_url = reverse('auth:login')
        self.register_url = reverse('auth:register')

        # Add feature status
        self.report.add_feature_status(
            'User Authentication',
            'completed',
            'Implemented user login, registration, and password reset functionality'
        )
        self.report.add_feature_status(
            'Permission Control',
            'completed',
            'Implemented role-based permission control system'
        )
        self.report.add_feature_status(
            'Social Login',
            'not_implemented',
            'Planned implementation of third-party social platform login'
        )

    def tearDown(self):
        """Generate report after tests"""
        self.report.save_report()
        self.report.generate_html_report()

    def test_tc_004_valid_login(self):
        """Test valid login credentials"""
        data = {
            'username': 'testuser',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, data, format='json')
        try:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('access', response.data)
            self.assertIn('refresh', response.data)
            self.report.add_test_result(
                'test_tc_004_valid_login',
                'passed',
                'Login successful',
                {'response': {k: v for k, v in response.data.items() if k != 'access'}}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_004_valid_login',
                'failed',
                str(e),
                response.data
            )
            raise

    def test_tc_005_invalid_password(self):
        """Test invalid password"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        try:
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
            self.report.add_test_result(
                'test_tc_005_invalid_password',
                'passed',
                'Returns 401 for invalid password',
                response.data
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_005_invalid_password',
                'failed',
                str(e),
                response.data
            )
            raise

    def test_tc_006_valid_registration(self):
        """Test valid user registration"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpassword123',
            'password2': 'newpassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        try:
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertTrue(User.objects.filter(username='newuser').exists())
            self.report.add_test_result(
                'test_tc_006_valid_registration',
                'passed',
                'User registration successful',
                {'request': data, 'response': response.data}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_006_valid_registration',
                'failed',
                str(e),
                {'request': data, 'response': response.data}
            )
            raise

    def test_tc_007_invalid_registration_password_mismatch(self):
        """Test registration with mismatched passwords"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpassword123',
            'password2': 'differentpassword'
        }
        response = self.client.post(self.register_url, data, format='json')
        try:
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertFalse(User.objects.filter(username='newuser').exists())
            self.report.add_test_result(
                'test_tc_007_invalid_registration_password_mismatch',
                'passed',
                'Returns 400 for password mismatch',
                {'request': data, 'response': response.data}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_007_invalid_registration_password_mismatch',
                'failed',
                str(e),
                {'request': data, 'response': response.data}
            )
            raise

    def test_tc_008_invalid_registration_existing_username(self):
        """Test registration with existing username"""
        data = {
            'username': 'testuser',  # Already exists
            'email': 'another@example.com',
            'password': 'newpassword123',
            'password2': 'newpassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        try:
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.report.add_test_result(
                'test_tc_008_invalid_registration_existing_username',
                'passed',
                'Returns 400 for existing username',
                {'request': data, 'response': response.data}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_008_invalid_registration_existing_username',
                'failed',
                str(e),
                {'request': data, 'response': response.data}
            )
            raise 