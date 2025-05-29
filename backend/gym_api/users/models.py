from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    自定义用户模型
    """
    ROLE_CHOICES = (
        ('admin', '管理员'),
        ('staff', '员工'),
        ('member', '会员'),
        ('user', '普通用户'),
    )
    
    MEMBERSHIP_STATUS_CHOICES = (
        ('active', '有效'),
        ('expired', '已过期'),
        ('suspended', '已暂停'),
        ('cancelled', '已取消'),
    )
    
    # 基本信息
    phone = models.CharField(_('手机号'), max_length=11, unique=True, null=True, blank=True, 
                           help_text=_('用于登录和通知的手机号码'))
    role = models.CharField(_('角色'), max_length=10, choices=ROLE_CHOICES, default='user',
                           help_text=_('用户角色：管理员、员工、会员或普通用户'))
    avatar = models.CharField(_('头像URL'), max_length=500, null=True, blank=True)
    
    # 会员信息
    member_id = models.CharField(_('会员ID'), max_length=20, unique=True, null=True, blank=True,
                              help_text=_('会员卡号'))
    birth_date = models.DateField(_('出生日期'), null=True, blank=True)
    gender = models.CharField(_('性别'), max_length=10, choices=[('male', '男'), ('female', '女'), ('other', '其他')], 
                            null=True, blank=True)
    address = models.TextField(_('地址'), null=True, blank=True)
    
    # 会员卡信息
    membership_start = models.DateField(_('会员开始日期'), null=True, blank=True)
    membership_end = models.DateField(_('会员结束日期'), null=True, blank=True)
    membership_type = models.CharField(_('会员类型'), max_length=20, null=True, blank=True,
                                    choices=[('monthly', '月卡'), ('quarterly', '季卡'), ('yearly', '年卡')])
    membership_status = models.CharField(_('会员状态'), max_length=20, choices=MEMBERSHIP_STATUS_CHOICES, 
                                      default='active', null=True, blank=True)
    membership_plan_id = models.IntegerField(_('会员套餐ID'), null=True, blank=True)
    membership_plan_name = models.CharField(_('会员套餐名称'), max_length=100, null=True, blank=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('用户')
        verbose_name_plural = _('用户')
        db_table = 'gym_user'
        
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class UserProfile(models.Model):
    """
    用户健身档案
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile',
                              verbose_name=_('用户'))
    height = models.DecimalField(_('身高(cm)'), max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(_('体重(kg)'), max_digits=5, decimal_places=2, null=True, blank=True)
    health_condition = models.TextField(_('健康状况'), null=True, blank=True, 
                                      help_text=_('记录用户的健康状况、疾病史或注意事项'))
    fitness_goal = models.CharField(_('健身目标'), max_length=50, null=True, blank=True,
                                choices=[
                                    ('weight_loss', '减肥'),
                                    ('muscle_gain', '增肌'),
                                    ('fitness', '健身'),
                                    ('wellness', '健康'),
                                    ('rehabilitation', '康复'),
                                    ('other', '其他')
                                ])
    fitness_level = models.CharField(_('健身水平'), max_length=20, null=True, blank=True,
                                  choices=[
                                      ('beginner', '初学者'),
                                      ('intermediate', '中级'),
                                      ('advanced', '高级')
                                  ])
    notes = models.TextField(_('备注'), null=True, blank=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('用户健身档案')
        verbose_name_plural = _('用户健身档案')
        db_table = 'gym_user_profile'
        
    def __str__(self):
        return f"{self.user.username}的健身档案" 