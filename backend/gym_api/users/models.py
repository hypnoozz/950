from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

class User(AbstractUser):
    """
    Custom User Model
    """
    ROLE_CHOICES = (
        ('user', 'User'),
        ('member', 'Member'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    )
    
    MEMBERSHIP_STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
        ('cancelled', 'Cancelled'),
    )
    
    # Basic Information
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar = models.CharField(max_length=500, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Membership Information
    member_id = models.CharField(_('Member ID'), max_length=20, unique=True, null=True, blank=True,
                              help_text=_('Membership card number'))
    birth_date = models.DateField(_('Birth Date'), null=True, blank=True)
    gender = models.CharField(_('Gender'), max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], 
                            null=True, blank=True)
    
    # Membership Card Information
    membership_start = models.DateField(_('Membership Start Date'), null=True, blank=True)
    membership_end = models.DateField(_('Membership End Date'), null=True, blank=True)
    membership_type = models.CharField(_('Membership Type'), max_length=20, null=True, blank=True,
                                    choices=[('monthly', 'Monthly'), ('quarterly', 'Quarterly'), ('yearly', 'Yearly')])
    membership_status = models.CharField(_('Membership Status'), max_length=20, choices=MEMBERSHIP_STATUS_CHOICES, 
                                      default='active', null=True, blank=True)
    membership_plan_id = models.IntegerField(_('Membership Plan ID'), null=True, blank=True)
    membership_plan_name = models.CharField(_('Membership Plan Name'), max_length=100, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        db_table = 'gym_user'
        
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    def has_active_membership(self):
        """Check if user has an active membership"""
        return self.memberships.filter(
            is_active=True,
            end_date__gt=timezone.now()
        ).exists()

    def get_active_membership(self):
        """Get user's active membership if exists"""
        return self.memberships.filter(
            is_active=True,
            end_date__gt=timezone.now()
        ).first()

    def get_enrolled_courses(self):
        """Get all courses user is enrolled in"""
        return self.enrollments.filter(
            schedule__start_time__gt=timezone.now()
        ).select_related('schedule', 'schedule__course')


class UserProfile(models.Model):
    """
    用户健身档案
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile',
                              verbose_name=_('User'))
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    health_condition = models.TextField(_('Health Condition'), null=True, blank=True, 
                                      help_text=_('Record user\'s health condition, medical history, or precautions'))
    fitness_goal = models.CharField(_('Fitness Goal'), max_length=50, null=True, blank=True,
                                choices=[
                                    ('weight_loss', 'Weight Loss'),
                                    ('muscle_gain', 'Muscle Gain'),
                                    ('fitness', 'Fitness'),
                                    ('wellness', 'Wellness'),
                                    ('rehabilitation', 'Rehabilitation'),
                                    ('other', 'Other')
                                ])
    fitness_level = models.CharField(_('Fitness Level'), max_length=20, null=True, blank=True,
                                  choices=[
                                      ('beginner', 'Beginner'),
                                      ('intermediate', 'Intermediate'),
                                      ('advanced', 'Advanced')
                                  ])
    notes = models.TextField(_('Notes'), null=True, blank=True)
    medical_conditions = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('User Fitness Profile')
        verbose_name_plural = _('User Fitness Profiles')
        db_table = 'gym_user_profile'
        
    def __str__(self):
        return f"{self.user.username}'s Fitness Profile" 