"""gym_project URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView, RedirectView
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Define a simple view for path checking
def check_path(request):
    return HttpResponse(f"Requested path: {request.path}")

# All API and backend management routes
urlpatterns = [
    # Redirect root to admin
    path('', RedirectView.as_view(url='/admin/', permanent=False)),

    # Django admin
    path('admin/', admin.site.urls), # Standard admin path

    # API routes
    path('api/users/', include('gym_api.users.urls')),
    path('api/courses/', include('gym_api.courses.urls')),
    path('api/orders/', include('gym_api.orders.urls')),
    path('api/auth/', include('gym_api.auth.urls')),

    # JWT authentication routes
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Other backend routes (e.g., API root)
    path('api/', include('gym_api.urls')),

    # Path checking for debugging
    path('check-path/', check_path),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

import logging
logger = logging.getLogger(__name__)
logger.info("URL patterns loaded: %s", urlpatterns) 