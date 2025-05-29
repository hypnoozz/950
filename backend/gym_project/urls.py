"""gym_project URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# 自定义Admin站点标题
admin.site.site_header = 'Gym System Admin'
admin.site.site_title = 'Gym System Admin Portal'
admin.site.index_title = 'Welcome to Gym System Admin Portal'

# 定义一个简单视图用于检查是否在前端路由或API路由
def check_path(request):
    return HttpResponse(f"Requested path: {request.path}")

# 所有API和后端管理路由
api_urlpatterns = [
    # Django管理后台使用django-admin路径
    path('django-admin/', admin.site.urls),
    
    # API 路由
    path('api/users/', include('gym_api.users.urls')),
    path('api/courses/', include('gym_api.courses.urls')),
    path('api/orders/', include('gym_api.orders.urls')),
    path('api/auth/', include('gym_api.auth.urls')),
    
    # JWT 认证路由
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 其他后端路由
    path('api/', include('gym_api.urls')),

    # 用于调试的路径检查
    path('check-path/', check_path),
]

urlpatterns = api_urlpatterns

# 静态文件和媒体文件路由
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# 将所有其他请求发送到前端应用
# 这些是处理前端路由的配置
# 注意正则表达式匹配除了API和Admin路径之外的所有内容
urlpatterns += [
    re_path(r'^admin/.*$', TemplateView.as_view(template_name='index.html')),
    re_path(r'^(?!api/|django-admin/|static/|media/|check-path/).*$', TemplateView.as_view(template_name='index.html')),
] 