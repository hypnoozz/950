# gym_api 初始化文件 
from django.apps import AppConfig

class GymApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gym_api'

    def ready(self):
        # 添加 CORS 配置
        from django.conf import settings
        if not hasattr(settings, 'CORS_ALLOWED_ORIGINS'):
            settings.CORS_ALLOWED_ORIGINS = [
                "http://localhost:3000",  # React 开发服务器
                "http://127.0.0.1:3000",
            ]
        if not hasattr(settings, 'CORS_ALLOW_CREDENTIALS'):
            settings.CORS_ALLOW_CREDENTIALS = True 