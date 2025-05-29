from django.urls import path
from .views import (
    ImageUploadView,
    ImageListView,
    ImageDetailView,
    ImagePreviewView,
    AdminImageListView,
    AdminImageDetailView,
    GetImageByBusinessView,
)

app_name = 'uploads'

urlpatterns = [
    # 用户接口
    path('images/', ImageUploadView.as_view(), name='image-upload'),
    path('images/list/', ImageListView.as_view(), name='image-list'),
    path('images/<int:pk>/', ImageDetailView.as_view(), name='image-detail'),
    path('images/<int:pk>/preview/', ImagePreviewView.as_view(), name='image-preview'),
    path('images/business/<str:business_type>/<int:business_id>/', GetImageByBusinessView.as_view(), name='image-by-business'),
    
    # 管理员接口
    path('admin/images/', AdminImageListView.as_view(), name='admin-image-list'),
    path('admin/images/<int:pk>/', AdminImageDetailView.as_view(), name='admin-image-detail'),
] 