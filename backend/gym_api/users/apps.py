from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gym_api.users'
    verbose_name = _('用户管理')
    
    def ready(self):
        # 导入信号处理器
        import gym_api.users.signals 