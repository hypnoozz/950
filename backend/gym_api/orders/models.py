from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid
from gym_api.users.models import User
from gym_api.courses.models import Course

class MembershipPlan(models.Model):
    """
    会员套餐模型
    """
    PLAN_TYPE_CHOICES = [
        ('monthly', '月卡'),
        ('quarterly', '季卡'),
        ('yearly', '年卡'),
        ('custom', '自定义'),
    ]
    
    name = models.CharField(_('套餐名称'), max_length=100)
    plan_type = models.CharField(_('套餐类型'), max_length=20, choices=PLAN_TYPE_CHOICES)
    duration = models.IntegerField(_('有效期(天)'))
    price = models.DecimalField(_('价格'), max_digits=10, decimal_places=2)
    description = models.TextField(_('套餐描述'), blank=True, null=True)
    benefits = models.TextField(_('套餐福利'), blank=True, null=True)
    is_active = models.BooleanField(_('是否激活'), default=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('会员套餐')
        verbose_name_plural = _('会员套餐')
        db_table = 'gym_membership_plan'
        
    def __str__(self):
        return f"{self.name} ({self.get_plan_type_display()}) - {self.price}元"

class Order(models.Model):
    """
    订单模型
    """
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('cancelled', '已取消'),
        ('refunded', '已退款'),
    ]
    
    ORDER_TYPE_CHOICES = [
        ('membership', '会员套餐'),
        ('course', '课程'),
        ('product', '商品'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('wechat', '微信支付'),
        ('alipay', '支付宝'),
        ('cash', '现金'),
        ('card', '银行卡'),
    ]
    
    order_id = models.CharField(_('订单号'), max_length=50, unique=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders',
                          verbose_name=_('用户'))
    order_type = models.CharField(_('订单类型'), max_length=20, choices=ORDER_TYPE_CHOICES)
    status = models.CharField(_('订单状态'), max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # 金额信息
    total_amount = models.DecimalField(_('订单总金额'), max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(_('优惠金额'), max_digits=10, decimal_places=2, default=0)
    actual_amount = models.DecimalField(_('实际支付金额'), max_digits=10, decimal_places=2)
    
    # 支付信息
    payment_method = models.CharField(_('支付方式'), max_length=20, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    payment_id = models.CharField(_('支付交易号'), max_length=100, null=True, blank=True)
    paid_at = models.DateTimeField(_('支付时间'), null=True, blank=True)
    
    remark = models.TextField(_('备注'), null=True, blank=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('订单')
        verbose_name_plural = _('订单')
        db_table = 'gym_order'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"订单{self.order_id} - {self.user.username} - {self.actual_amount}元"

class OrderItem(models.Model):
    """
    订单项模型
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items',
                           verbose_name=_('订单'))
    
    # 关联的商品信息，根据订单类型关联不同模型
    membership_plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name='order_items', verbose_name=_('会员套餐'))
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True,
                            related_name='order_items', verbose_name=_('课程'))
    
    # 通用商品信息
    item_name = models.CharField(_('商品名称'), max_length=200)
    item_price = models.DecimalField(_('商品单价'), max_digits=10, decimal_places=2)
    quantity = models.IntegerField(_('数量'), default=1)
    item_total = models.DecimalField(_('商品总价'), max_digits=10, decimal_places=2)
    
    class Meta:
        verbose_name = _('订单项')
        verbose_name_plural = _('订单项')
        db_table = 'gym_order_item'
        
    def __str__(self):
        return f"{self.item_name} x {self.quantity} - {self.item_total}元"
    
    def save(self, *args, **kwargs):
        # 自动计算商品总价
        self.item_total = self.item_price * self.quantity
        super().save(*args, **kwargs) 