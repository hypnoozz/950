from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid
from gym_api.users.models import User
from gym_api.courses.models import Course
from django.conf import settings
from django.utils import timezone

class MembershipPlan(models.Model):
    """
    Membership Plan Model
    """
    PLAN_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    name = models.CharField('Plan Name', max_length=100)
    plan_type = models.CharField('Plan Type', max_length=20, choices=PLAN_TYPE_CHOICES, default='monthly')
    duration = models.IntegerField('Duration (days)', default=30)
    price = models.DecimalField('Price', max_digits=10, decimal_places=2)
    description = models.TextField('Description', blank=True, null=True)
    benefits = models.TextField('Benefits', blank=True, null=True)
    is_active = models.BooleanField('Is Active', default=True)
    created_at = models.DateTimeField('Created At', auto_now_add=True)
    updated_at = models.DateTimeField('Updated At', auto_now=True)

    class Meta:
        verbose_name = 'Membership Plan'
        verbose_name_plural = 'Membership Plans'
        db_table = 'gym_membership_plan'

    def __str__(self):
        return f"{self.name} (Monthly) - {self.price}$"

class Order(models.Model):
    """
    订单模型
    """
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        db_table = 'gym_order'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number}"

class OrderItem(models.Model):
    """
    订单项模型
    """
    ITEM_TYPE_CHOICES = (
        ('course', 'Course'),
        ('membership', 'Membership'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPE_CHOICES)
    item_id = models.IntegerField()
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    item_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
        db_table = 'gym_order_item'

    def __str__(self):
        return f"{self.item_type} - {self.item_id}"
    
    def save(self, *args, **kwargs):
        self.item_total = self.price * self.quantity
        super().save(*args, **kwargs)

class Membership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Membership'
        verbose_name_plural = 'Memberships'
        db_table = 'gym_membership'

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"

    def save(self, *args, **kwargs):
        if not self.start_date:
            self.start_date = timezone.now()
        if not self.end_date and self.plan:
            self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs) 