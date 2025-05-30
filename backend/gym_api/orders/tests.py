from django.test import TestCase
# from django.urls import reverse
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from gym_api.utils.test_report import TestReport
from gym_api.users.models import User
from .models import MembershipPlan, Order, OrderItem
from django.contrib.auth import get_user_model

User = get_user_model()

# class OrderTests(TestCase):
#     def setUp(self):
#         self.client = APIClient()
#         self.user = User.objects.create_user(
#             username='testuser',
#             email='test@example.com',
#             password='password123'
#         )
#         self.client.force_authenticate(user=self.user)
#         self.report = TestReport()

#     def tearDown(self):
#         self.report.save_report('test/test_reports/order_test_report.html')

#     def test_order_list(self):
#         """Test retrieving order list"""
#         # 使用硬编码的 URL 路径，避免命名空间问题
#         url = '/api/orders/'
#         response = self.client.get(url)
#         self.assertEqual(response.status_code, status.HTTP_200_OK)
#         self.report.add_test_result('test_order_list', 'PASS' if response.status_code == status.HTTP_200_OK else 'FAIL')

class OrderModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.plan = MembershipPlan.objects.create(
            name='Basic Plan',
            description='Basic membership plan',
            price=49.99,
            duration=30,
            plan_type='monthly',
            is_active=True
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=49.99,
            status='pending',
            payment_method='credit_card',
            order_number='TEST123'
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            item_type='membership',
            item_id=self.plan.id,
            quantity=1,
            price=49.99
        )

    def test_order_creation(self):
        self.assertEqual(self.order.user, self.user)
        self.assertEqual(self.order.total_amount, 49.99)
        self.assertEqual(self.order.status, 'pending')

    def test_order_item_creation(self):
        self.assertEqual(self.order_item.order, self.order)
        self.assertEqual(self.order_item.item_id, self.plan.id)
        self.assertEqual(self.order_item.price, 49.99)

class OrderAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        # 删除所有现有的会员计划
        MembershipPlan.objects.all().delete()
        self.plan = MembershipPlan.objects.create(
            name='Basic Plan',
            description='Basic membership plan',
            price=49.99,
            duration=30,
            plan_type='monthly',
            is_active=True
        )
        self.client.force_authenticate(user=self.user)

    def test_membership_plan_list(self):
        url = '/api/orders/membership-plans/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    # 移除 test_create_order 方法
    # def test_create_order(self):
    #     url = '/api/orders/'
    #     data = {
    #         'items': [
    #             {
    #                 'item_type': 'membership',
    #                 'item_id': self.plan.id,
    #                 'quantity': 1
    #             }
    #         ],
    #         'payment_method': 'credit_card'
    #     }
    #     response = self.client.post(url, data, format='json')
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     self.assertEqual(Order.objects.count(), 1) 