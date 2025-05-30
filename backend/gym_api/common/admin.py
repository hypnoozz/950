from django.contrib import admin
from django.conf import settings

admin.site.site_header = getattr(settings, 'ADMIN_SITE_HEADER', 'Gym Management System')
admin.site.site_title = getattr(settings, 'ADMIN_SITE_TITLE', 'Gym Management Portal')
admin.site.index_title = getattr(settings, 'ADMIN_INDEX_TITLE', 'Welcome to Gym Management Portal') 