from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from gym_api.orders.views import MembershipPlanListCreateView, MembershipPlanDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('gym_api.auth.urls')),
    path('api/users/', include('gym_api.users.urls')),
    path('api/courses/', include('gym_api.courses.urls')),
    path('api/orders/', include('gym_api.orders.urls')),
    # 会员套餐专用路由
    path('api/membership-plans/', MembershipPlanListCreateView.as_view()),
    path('api/membership-plans/<int:pk>/', MembershipPlanDetailView.as_view()),
    # 图片上传接口
    path('api/uploads/', include('gym_api.common.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 