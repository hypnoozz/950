from django.db import models
from django.utils.translation import gettext_lazy as _
from gym_api.users.models import User

class CourseCategory(models.Model):
    """
    Course Category Model
    """
    name = models.CharField(_('Category Name'), max_length=50)
    description = models.TextField(_('Category Description'), blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Course Category')
        verbose_name_plural = _('Course Categories')
        db_table = 'gym_course_category'
        
    def __str__(self):
        return self.name

class Course(models.Model):
    """
    Course Model
    """
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    name = models.CharField(_('Course Name'), max_length=100)
    description = models.TextField(_('Course Description'))
    category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE, related_name='courses',
                              verbose_name=_('Category'))
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taught_courses',
                                verbose_name=_('Instructor'), limit_choices_to={'role': 'staff'})
    image = models.CharField(_('Course Image URL'), max_length=500, null=True, blank=True)
    price = models.DecimalField(_('Price'), max_digits=10, decimal_places=2)
    duration = models.IntegerField(_('Duration (minutes)'))
    capacity = models.IntegerField(_('Capacity'), help_text=_('Maximum number of participants'))
    difficulty = models.CharField(_('Difficulty Level'), max_length=15, choices=DIFFICULTY_CHOICES, default='beginner')
    is_active = models.BooleanField(_('Is Active'), default=True)
    
    # Metadata
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        db_table = 'gym_course'
        
    def __str__(self):
        return self.name

class CourseSchedule(models.Model):
    """
    Course Schedule Model
    """
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules',
                            verbose_name=_('Course'))
    start_time = models.DateTimeField(_('Start Time'))
    end_time = models.DateTimeField(_('End Time'))
    location = models.CharField(_('Location'), max_length=100)
    current_capacity = models.IntegerField(_('Current Capacity'), default=0)
    
    # Metadata
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Course Schedule')
        verbose_name_plural = _('Course Schedules')
        db_table = 'gym_course_schedule'
        
    def __str__(self):
        return f"{self.course.name} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class CourseEnrollment(models.Model):
    """
    Course Enrollment Model
    """
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments',
                          verbose_name=_('User'))
    schedule = models.ForeignKey(CourseSchedule, on_delete=models.CASCADE, related_name='enrollments',
                              verbose_name=_('Schedule'))
    status = models.CharField(_('Status'), max_length=15, choices=STATUS_CHOICES, default='enrolled')
    attendance = models.BooleanField(_('Attendance'), null=True, blank=True)
    feedback = models.TextField(_('Feedback'), null=True, blank=True)
    rating = models.IntegerField(_('Rating'), null=True, blank=True, choices=[(i, i) for i in range(1, 6)])
    
    # Metadata
    created_at = models.DateTimeField(_('Created At'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Updated At'), auto_now=True)
    
    class Meta:
        verbose_name = _('Course Enrollment')
        verbose_name_plural = _('Course Enrollments')
        db_table = 'gym_course_enrollment'
        unique_together = ('user', 'schedule')  # Ensure users cannot enroll in the same course twice
        
    def __str__(self):
        return f"{self.user.username} - {self.schedule.course.name}" 