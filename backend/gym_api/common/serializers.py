from rest_framework import serializers
from .models import UploadedImage

class UploadedImageSerializer(serializers.ModelSerializer):
    """
    上传图片序列化器
    """
    business_type_display = serializers.CharField(source='get_business_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UploadedImage
        fields = [
            'id', 'image', 'business_type', 'business_type_display', 
            'business_id', 'title', 'description', 'is_active',
            'filename', 'file_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'filename', 'file_url', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        """
        获取完整的文件URL
        """
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None 