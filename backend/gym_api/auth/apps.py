from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gym_api.auth'
    label = 'gym_auth'
    verbose_name = _('认证与授权') 