from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_test_users(apps, schema_editor):
    User = apps.get_model('users', 'User')
    
    # 创建管理员账号
    User.objects.create(
        username='admin',
        email='admin@example.com',
        password=make_password('admin123'),
        role='admin',
        is_active=True,
        is_staff=True,
        is_superuser=True
    )
    
    # 创建教练账号
    User.objects.create(
        username='trainer',
        email='trainer@example.com',
        password=make_password('trainer123'),
        role='staff',
        is_active=True,
        is_staff=True
    )
    
    # 创建会员账号
    User.objects.create(
        username='member',
        email='member@example.com',
        password=make_password('member123'),
        role='member',
        is_active=True
    )
    
    # 创建普通用户账号
    User.objects.create(
        username='user',
        email='user@example.com',
        password=make_password('user123'),
        role='user',
        is_active=True
    )

def remove_test_users(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(username__in=['admin', 'trainer', 'member', 'user']).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0004_alter_user_options_alter_userprofile_options_and_more'),
    ]

    operations = [
        migrations.RunPython(create_test_users, remove_test_users),
    ] 