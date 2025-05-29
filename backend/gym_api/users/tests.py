from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, UserProfile
from ..utils.test_report import TestReport

class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.report = TestReport()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123',
            phone='1234567890',
            address='Test Address'
        )
        self.profile, created = UserProfile.objects.get_or_create(
            user=self.user,
            defaults={
                'height': 175.5,
                'weight': 70.0,
                'fitness_goal': 'weight_loss',
                'fitness_level': 'beginner'
            }
        )
        self.client.force_authenticate(user=self.user)
        self.user_detail_url = reverse('gym_users:user-detail', args=[self.user.id])
        self.profile_url = reverse('gym_users:user-profile', args=[self.user.id])
        self.user_list_url = reverse('gym_users:user-list-create')

        # Add feature status
        self.report.add_feature_status(
            'User Management',
            'completed',
            'Implemented user information CRUD operations'
        )
        self.report.add_feature_status(
            'Membership Management',
            'completed',
            'Implemented membership level and points management'
        )
        self.report.add_feature_status(
            'Trainer Management',
            'in_progress',
            'Currently implementing trainer information management'
        )
        self.report.add_feature_status(
            'Course Management',
            'not_implemented',
            'Planned implementation of course booking and scheduling'
        )

    def tearDown(self):
        """Generate report after tests"""
        self.report.save_report()
        self.report.generate_html_report()

    def test_tc_009_get_user_profile(self):
        """Test retrieving user profile"""
        response = self.client.get(self.profile_url)
        try:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['user_id'], self.user.id)
            self.report.add_test_result(
                'test_tc_009_get_user_profile',
                'passed',
                'Successfully retrieved user information',
                {'response': response.data}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_009_get_user_profile',
                'failed',
                str(e),
                response.data
            )
            raise

    def test_tc_010_update_user_profile(self):
        """Test updating user profile"""
        data = {
            'height': 180.0,
            'weight': 75.0,
            'fitness_goal': 'muscle_gain'
        }
        response = self.client.patch(self.profile_url, data, format='json')
        try:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(float(response.data['height']), 180.0)
            self.assertEqual(float(response.data['weight']), 75.0)
            self.assertEqual(response.data['fitness_goal'], 'muscle_gain')
            self.report.add_test_result(
                'test_tc_010_update_user_profile',
                'passed',
                'Successfully updated user information',
                {'request': data, 'response': response.data}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_010_update_user_profile',
                'failed',
                str(e),
                {'request': data, 'response': response.data}
            )
            raise

    def test_tc_011_get_user_list_admin(self):
        """Test admin can get user list"""
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.client.force_authenticate(user=admin_user)
        response = self.client.get(self.user_list_url)
        try:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            usernames = [user['username'] for user in response.data['results']]
            self.assertIn('admin', usernames)
            self.assertIn('testuser', usernames)
            self.report.add_test_result(
                'test_tc_011_get_user_list_admin',
                'passed',
                'Admin successfully retrieved user list',
                {'response': {'count': response.data['count'], 'usernames': usernames}}
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_011_get_user_list_admin',
                'failed',
                str(e),
                response.data
            )
            raise

    def test_tc_012_non_admin_cannot_get_user_list(self):
        """Test non-admin cannot get user list"""
        response = self.client.get(self.user_list_url)
        try:
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
            self.report.add_test_result(
                'test_tc_012_non_admin_cannot_get_user_list',
                'passed',
                'Non-admin users cannot access user list',
                response.data
            )
        except AssertionError as e:
            self.report.add_test_result(
                'test_tc_012_non_admin_cannot_get_user_list',
                'failed',
                str(e),
                response.data
            )
            raise 