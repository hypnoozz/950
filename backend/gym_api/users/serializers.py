from rest_framework import serializers
from django.contrib.auth import password_validation
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import User, UserProfile
from gym_api.orders.models import MembershipPlan
import logging

logger = logging.getLogger(__name__)

# 先定义 UserProfileSerializer
class UserProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_id', 'height', 'weight', 'health_condition',
            'fitness_goal', 'fitness_level', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

# 再定义 UserSerializer
class UserSerializer(serializers.ModelSerializer):
    """
    User serializer
    """
    profile = UserProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    password2 = serializers.CharField(write_only=True, required=False)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    membership_status_display = serializers.CharField(source='get_membership_status_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name',
            'phone', 'role', 'role_display', 'avatar', 'is_active',
            'member_id', 'birth_date', 'gender', 'address', 
            'membership_start', 'membership_end', 'membership_type',
            'membership_status', 'membership_status_display',
            'membership_plan_id', 'membership_plan_name', 'profile',
            'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'password2': {'write_only': True},
            'phone': {'required': False},
            'email': {'required': True},
        }
    
    def validate_password(self, value):
        """
        Basic password validation - only check minimum length
        """
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long")
        return value
    
    def validate(self, data):
        """
        Validate that passwords match
        """
        if data.get('password2') and data.get('password') != data.get('password2'):
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data
    
    def validate_username(self, value):
        """
        Validate username uniqueness
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        """
        Validate email uniqueness
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_phone(self, value):
        """
        Validate phone number format and uniqueness
        """
        if value:
            if not value.isdigit() or len(value) != 11:
                raise serializers.ValidationError("Invalid phone number format")
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError("Phone number already exists")
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """
        Create user and set password with transaction
        """
        try:
            # Extract passwords
            password = validated_data.pop('password')
            validated_data.pop('password2', None)  # Remove password2 if present
            
            # Create user with default role
            if 'role' not in validated_data:
                validated_data['role'] = 'user'
            
            # Create user
            user = User.objects.create_user(
                username=validated_data.pop('username'),
                email=validated_data.pop('email'),
                password=password,
                **validated_data
            )
            
            # Create or get user profile
            UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'fitness_goal': 'fitness',
                    'fitness_level': 'beginner'
                }
            )
            
            return user
            
        except Exception as e:
            logger.error(f"User creation failed: {str(e)}", exc_info=True)
            # Ensure rollback on error
            transaction.set_rollback(True)
            raise serializers.ValidationError(f"User creation failed: {str(e)}")
    
    def update(self, instance, validated_data):
        """
        Update user information and optionally update password
        """
        try:
            password = validated_data.pop('password', None)
            user = super().update(instance, validated_data)
            
            if password:
                user.set_password(password)
                user.save()
                
            return user
            
        except Exception as e:
            logger.error(f"User update failed: {str(e)}")
            raise serializers.ValidationError(f"User update failed: {str(e)}")

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'height', 'weight', 'health_condition',
            'fitness_goal', 'fitness_level', 'notes'
        ]

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value 

class MembershipPlanSimpleSerializer(serializers.ModelSerializer):
    """
    会员套餐简单序列化器
    """
    class Meta:
        model = MembershipPlan
        fields = ['id', 'name', 'plan_type', 'duration', 'price', 'benefits']

class UserMembershipSerializer(serializers.ModelSerializer):
    """
    用户会员信息序列化器
    """
    membership_plan = MembershipPlanSimpleSerializer(read_only=True)
    status_display = serializers.CharField(source='get_membership_status_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'member_id', 'membership_start', 'membership_end',
            'membership_type', 'membership_status', 'status_display',
            'membership_plan_id', 'membership_plan_name', 'membership_plan'
        ]
        read_only_fields = ['id', 'member_id']

class UserMembershipUpdateSerializer(serializers.ModelSerializer):
    """
    User membership update serializer
    """
    class Meta:
        model = User
        fields = [
            'membership_start', 'membership_end', 'membership_type',
            'membership_status', 'membership_plan_id', 'membership_plan_name'
        ]
        
    def validate(self, data):
        """
        Validate membership plan ID and name match
        """
        plan_id = data.get('membership_plan_id')
        plan_name = data.get('membership_plan_name')
        
        if plan_id:
            try:
                plan = MembershipPlan.objects.get(id=plan_id)
                # If plan_id provided but plan_name not provided, auto-fill
                if not plan_name:
                    data['membership_plan_name'] = plan.name
                    
                # If membership_type not provided, auto-fill
                if 'membership_type' not in data:
                    data['membership_type'] = plan.plan_type
            except MembershipPlan.DoesNotExist:
                raise serializers.ValidationError("Specified membership plan does not exist")
                
        return data 