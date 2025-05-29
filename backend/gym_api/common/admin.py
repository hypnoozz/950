from django.contrib import admin
from .models import UploadedImage

@admin.register(UploadedImage)
class UploadedImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'business_type', 'business_id', 'filename', 'is_active', 'created_at')
    list_filter = ('business_type', 'is_active')
    search_fields = ('title', 'description', 'business_id')
    list_display_links = ('id', 'title')
    date_hierarchy = 'created_at' 