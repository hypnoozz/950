from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse, Http404
from django.conf import settings
import os

from .models import UploadedImage
from .serializers import UploadedImageSerializer
from gym_api.auth.permissions import IsStaffOrAdmin

class ImageUploadView(generics.CreateAPIView):
    """
    图片上传API
    POST /api/uploads/images/
    """
    serializer_class = UploadedImageSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """
        执行创建，自动关联当前用户
        """
        serializer.save()

class ImageListView(generics.ListAPIView):
    """
    图片列表API
    GET /api/uploads/images/
    支持过滤: ?business_type=user&business_id=1
    """
    serializer_class = UploadedImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        根据查询参数过滤图片
        """
        queryset = UploadedImage.objects.filter(is_active=True)
        
        # 根据业务类型和ID筛选
        business_type = self.request.query_params.get('business_type')
        business_id = self.request.query_params.get('business_id')
        
        if business_type:
            queryset = queryset.filter(business_type=business_type)
        
        if business_id:
            queryset = queryset.filter(business_id=business_id)
        
        return queryset

class GetImageByBusinessView(APIView):
    """
    根据业务类型和业务ID获取图片API
    GET /api/uploads/images/business/{business_type}/{business_id}/
    直接返回第一张匹配的图片，如果找不到则返回404
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, business_type, business_id, format=None):
        try:
            # 查询指定业务类型和ID的图片，获取第一张
            image = UploadedImage.objects.filter(
                business_type=business_type,
                business_id=business_id,
                is_active=True
            ).first()
            
            if not image:
                return Response({"detail": "找不到匹配的图片"}, status=status.HTTP_404_NOT_FOUND)
            
            # 使用序列化器生成响应
            serializer = UploadedImageSerializer(image, context={"request": request})
            return Response(serializer.data)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    图片详情、更新和删除API
    GET/PUT/DELETE /api/uploads/images/<id>/
    """
    queryset = UploadedImage.objects.all()
    serializer_class = UploadedImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def destroy(self, request, *args, **kwargs):
        """
        重写删除方法，只将图片标记为不活跃，不实际删除文件
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ImagePreviewView(APIView):
    """
    图片预览API
    GET /api/uploads/images/<id>/preview/
    直接返回图片文件，而不是JSON响应
    """
    permission_classes = [permissions.AllowAny]  # 允许所有人访问预览
    
    def get(self, request, pk, format=None):
        try:
            image = UploadedImage.objects.get(pk=pk, is_active=True)
        except UploadedImage.DoesNotExist:
            raise Http404("图片不存在")
        
        # 获取图片文件路径
        file_path = os.path.join(settings.MEDIA_ROOT, image.image.name)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            raise Http404("图片文件不存在")
        
        # 确定内容类型
        content_type = self._get_content_type(file_path)
        
        # 读取文件并返回
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)
    
    def _get_content_type(self, file_path):
        """
        根据文件扩展名确定内容类型
        """
        extension = os.path.splitext(file_path)[1].lower()
        
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
        }
        
        return content_types.get(extension, 'application/octet-stream')

class AdminImageListView(generics.ListAPIView):
    """
    管理员图片列表API
    GET /api/admin/uploads/images/
    """
    serializer_class = UploadedImageSerializer
    permission_classes = [IsStaffOrAdmin]
    
    def get_queryset(self):
        """
        管理员可以查看所有图片，包括未激活的
        """
        queryset = UploadedImage.objects.all()
        
        # 根据参数筛选
        business_type = self.request.query_params.get('business_type')
        business_id = self.request.query_params.get('business_id')
        is_active = self.request.query_params.get('is_active')
        
        if business_type:
            queryset = queryset.filter(business_type=business_type)
        
        if business_id:
            queryset = queryset.filter(business_id=business_id)
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset

class AdminImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    管理员图片详情、更新和删除API
    GET/PUT/DELETE /api/admin/uploads/images/<id>/
    """
    queryset = UploadedImage.objects.all()
    serializer_class = UploadedImageSerializer
    permission_classes = [IsStaffOrAdmin]
    
    def destroy(self, request, *args, **kwargs):
        """
        管理员可以实际删除文件
        """
        instance = self.get_object()
        
        # 删除物理文件
        if instance.image and os.path.exists(instance.image.path):
            os.remove(instance.image.path)
            
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT) 