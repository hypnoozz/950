from django.db import models
from django.utils.translation import gettext_lazy as _
from gym_api.users.models import User

class CourseCategory(models.Model):
    """
    课程分类模型
    """
    name = models.CharField(_('分类名称'), max_length=50)
    description = models.TextField(_('分类描述'), blank=True, null=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('课程分类')
        verbose_name_plural = _('课程分类')
        db_table = 'gym_course_category'
        
    def __str__(self):
        return self.name

class Course(models.Model):
    """
    课程模型
    """
    DIFFICULTY_CHOICES = [
        ('beginner', '初级'),
        ('intermediate', '中级'),
        ('advanced', '高级'),
    ]
    
    name = models.CharField(_('课程名称'), max_length=100)
    description = models.TextField(_('课程描述'))
    category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE, related_name='courses',
                              verbose_name=_('课程分类'))
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taught_courses',
                                verbose_name=_('教练'), limit_choices_to={'role': 'staff'})
    image = models.CharField(_('课程图片URL'), max_length=500, null=True, blank=True)
    price = models.DecimalField(_('价格'), max_digits=10, decimal_places=2)
    duration = models.IntegerField(_('课时(分钟)'))
    capacity = models.IntegerField(_('课程容量'), help_text=_('最大参与人数'))
    difficulty = models.CharField(_('难度等级'), max_length=15, choices=DIFFICULTY_CHOICES, default='beginner')
    is_active = models.BooleanField(_('是否激活'), default=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('课程')
        verbose_name_plural = _('课程')
        db_table = 'gym_course'
        
    def __str__(self):
        return self.name

class CourseSchedule(models.Model):
    """
    课程排课模型
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules',
                            verbose_name=_('课程'))
    start_time = models.DateTimeField(_('开始时间'))
    end_time = models.DateTimeField(_('结束时间'))
    location = models.CharField(_('上课地点'), max_length=100)
    current_capacity = models.IntegerField(_('当前报名人数'), default=0)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('课程安排')
        verbose_name_plural = _('课程安排')
        db_table = 'gym_course_schedule'
        
    def __str__(self):
        return f"{self.course.name} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class CourseEnrollment(models.Model):
    """
    课程报名模型
    """
    STATUS_CHOICES = [
        ('enrolled', '已报名'),
        ('cancelled', '已取消'),
        ('completed', '已完成'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments',
                          verbose_name=_('用户'))
    schedule = models.ForeignKey(CourseSchedule, on_delete=models.CASCADE, related_name='enrollments',
                              verbose_name=_('课程安排'))
    status = models.CharField(_('状态'), max_length=15, choices=STATUS_CHOICES, default='enrolled')
    attendance = models.BooleanField(_('是否出席'), null=True, blank=True)
    feedback = models.TextField(_('反馈'), null=True, blank=True)
    rating = models.IntegerField(_('评分'), null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('课程报名')
        verbose_name_plural = _('课程报名')
        db_table = 'gym_course_enrollment'
        unique_together = ('user', 'schedule')  # 确保用户不能重复报名同一个课程
        
    def __str__(self):
        return f"{self.user.username} - {self.schedule.course.name}" 