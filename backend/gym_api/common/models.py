from django.db import models
from django.utils.translation import gettext_lazy as _
import os
import uuid

def upload_image_path(instance, filename):
    """
    定义上传路径，根据业务类型和ID组织目录结构
    格式: uploads/{business_type}/{year}/{month}/{uuid}.{ext}
    """
    # 获取文件扩展名
    ext = filename.split('.')[-1]
    # 生成唯一文件名
    filename = f"{uuid.uuid4().hex}.{ext}"
    # 按业务类型和日期组织目录
    from django.utils import timezone
    now = timezone.now()
    path = f"uploads/{instance.business_type}/{now.year}/{now.month:02d}/{filename}"
    return path

class UploadedImage(models.Model):
    """
    通用图片上传模型
    """
    BUSINESS_TYPE_CHOICES = (
        ('user', '用户头像'),
        ('course', '课程图片'),
        ('news', '新闻图片'),
        ('banner', '轮播图'),
        ('other', '其他'),
    )
    
    image = models.ImageField(_('图片'), upload_to=upload_image_path)
    business_type = models.CharField(_('业务类型'), max_length=20, choices=BUSINESS_TYPE_CHOICES, default='other')
    business_id = models.IntegerField(_('业务ID'), null=True, blank=True, 
                                   help_text=_('关联的业务对象ID，如用户ID、课程ID等'))
    title = models.CharField(_('标题'), max_length=100, null=True, blank=True)
    description = models.TextField(_('描述'), null=True, blank=True)
    is_active = models.BooleanField(_('是否激活'), default=True)
    
    # 元数据
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('上传图片')
        verbose_name_plural = _('上传图片')
        db_table = 'gym_uploaded_image'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.get_business_type_display()} - {self.title or self.id}"
    
    @property
    def filename(self):
        return os.path.basename(self.image.name)
    
    @property
    def file_url(self):
        return self.image.url if self.image else None 