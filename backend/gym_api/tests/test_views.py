from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Class, Booking

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123'
        )

    def test_tc_004_valid_login(self):
        """Test valid login credentials"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_tc_005_invalid_password(self):
        """Test invalid password"""
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ClassBookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123'
        )
        self.class_obj = Class.objects.create(
            name='Yoga',
            capacity=20,
            current_bookings=0
        )

    def test_tc_010_book_class(self):
        """Test booking a class"""
        self.client.force_authenticate(user=self.user)
        url = reverse('book-class', args=[self.class_obj.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Booking.objects.count(), 1)

    def test_tc_011_cancel_booking(self):
        """Test cancelling a booking"""
        booking = Booking.objects.create(
            user=self.user,
            class_obj=self.class_obj
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('cancel-booking', args=[booking.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Booking.objects.count(), 0) 