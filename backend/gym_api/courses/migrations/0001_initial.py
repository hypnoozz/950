from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

def create_initial_data(apps, schema_editor):
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    Course = apps.get_model('courses', 'Course')
    CourseSchedule = apps.get_model('courses', 'CourseSchedule')
    User = apps.get_model('users', 'User')
    
    # Create course categories
    categories = [
        CourseCategory.objects.create(
            name='Yoga',
            description='Various yoga classes for all levels'
        ),
        CourseCategory.objects.create(
            name='Fitness',
            description='General fitness and workout classes'
        ),
        CourseCategory.objects.create(
            name='Swimming',
            description='Swimming lessons and water exercises'
        ),
        CourseCategory.objects.create(
            name='Martial Arts',
            description='Self-defense and martial arts training'
        ),
        CourseCategory.objects.create(
            name='Dance',
            description='Dance classes for fitness and fun'
        ),
    ]
    
    # Create instructors
    instructors = [
        User.objects.create(
            username='john_trainer',
            email='john@example.com',
            password='pbkdf2_sha256$600000$your_password_hash_here',
            role='staff',
            is_active=True,
            avatar='https://picsum.photos/200/200?random=201'
        ),
        User.objects.create(
            username='sarah_trainer',
            email='sarah@example.com',
            password='pbkdf2_sha256$600000$your_password_hash_here',
            role='staff',
            is_active=True,
            avatar='https://picsum.photos/200/200?random=202'
        ),
        User.objects.create(
            username='mike_trainer',
            email='mike@example.com',
            password='pbkdf2_sha256$600000$your_password_hash_here',
            role='staff',
            is_active=True,
            avatar='https://picsum.photos/200/200?random=203'
        ),
    ]
    
    # Create courses with proper images
    courses = [
        Course.objects.create(
            name='Hatha Yoga',
            description='Traditional yoga practice focusing on physical postures and breathing techniques',
            category=categories[0],
            instructor=instructors[0],
            image='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
            price=99.00,
            duration=60,
            capacity=20,
            difficulty='beginner',
            is_active=True
        ),
        Course.objects.create(
            name='Power Yoga',
            description='Dynamic and energetic yoga practice',
            category=categories[0],
            instructor=instructors[1],
            image='https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&h=600&fit=crop',
            price=129.00,
            duration=75,
            capacity=15,
            difficulty='intermediate',
            is_active=True
        ),
        Course.objects.create(
            name='CrossFit',
            description='High-intensity functional movements',
            category=categories[1],
            instructor=instructors[2],
            image='https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
            price=149.00,
            duration=60,
            capacity=12,
            difficulty='advanced',
            is_active=True
        ),
        Course.objects.create(
            name='Swimming Basics',
            description='Learn basic swimming techniques',
            category=categories[2],
            instructor=instructors[0],
            image='https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop',
            price=199.00,
            duration=45,
            capacity=8,
            difficulty='beginner',
            is_active=True
        ),
        Course.objects.create(
            name='Kickboxing',
            description='Cardio kickboxing for fitness',
            category=categories[3],
            instructor=instructors[2],
            image='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
            price=159.00,
            duration=60,
            capacity=15,
            difficulty='intermediate',
            is_active=True
        ),
        Course.objects.create(
            name='Zumba',
            description='Dance fitness program',
            category=categories[4],
            instructor=instructors[1],
            image='https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
            price=119.00,
            duration=45,
            capacity=20,
            difficulty='beginner',
            is_active=True
        ),
        Course.objects.create(
            name='Pilates',
            description='Core strengthening and flexibility',
            category=categories[1],
            instructor=instructors[0],
            image='https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
            price=139.00,
            duration=50,
            capacity=15,
            difficulty='intermediate',
            is_active=True
        ),
        Course.objects.create(
            name='Advanced Swimming',
            description='Advanced swimming techniques and training',
            category=categories[2],
            instructor=instructors[1],
            image='https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop',
            price=249.00,
            duration=60,
            capacity=6,
            difficulty='advanced',
            is_active=True
        ),
        Course.objects.create(
            name='Tai Chi',
            description='Ancient Chinese martial art for health and meditation',
            category=categories[3],
            instructor=instructors[2],
            image='https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
            price=129.00,
            duration=60,
            capacity=20,
            difficulty='beginner',
            is_active=True
        ),
        Course.objects.create(
            name='Hip Hop Dance',
            description='Modern hip hop dance class',
            category=categories[4],
            instructor=instructors[0],
            image='https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
            price=109.00,
            duration=45,
            capacity=15,
            difficulty='intermediate',
            is_active=True
        ),
    ]
    
    # Create course schedules with proper locations
    now = timezone.now()
    locations = [
        'Yoga Studio 1',
        'Yoga Studio 2',
        'CrossFit Area',
        'Swimming Pool',
        'Martial Arts Studio',
        'Dance Studio',
        'Main Gym',
        'Fitness Center',
        'Aquatic Center',
        'Dance Hall'
    ]
    
    for i, course in enumerate(courses):
        for j in range(3):  # Create 3 schedules for each course
            start_time = now + timedelta(days=j*2, hours=10)  # Every 2 days at 10 AM
            CourseSchedule.objects.create(
                course=course,
                start_time=start_time,
                end_time=start_time + timedelta(minutes=course.duration),
                location=locations[i % len(locations)],
                current_capacity=0
            )

def remove_initial_data(apps, schema_editor):
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    Course = apps.get_model('courses', 'Course')
    CourseSchedule = apps.get_model('courses', 'CourseSchedule')
    User = apps.get_model('users', 'User')
    
    # Remove all related data
    CourseSchedule.objects.all().delete()
    Course.objects.all().delete()
    CourseCategory.objects.all().delete()
    User.objects.filter(role='staff').delete()

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Create models
        migrations.CreateModel(
            name='CourseCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Category Name')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Category Description')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
            ],
            options={
                'verbose_name': 'Course Category',
                'verbose_name_plural': 'Course Categories',
                'db_table': 'gym_course_category',
            },
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Course Name')),
                ('description', models.TextField(verbose_name='Course Description')),
                ('image', models.CharField(blank=True, max_length=500, null=True, verbose_name='Course Image URL')),
                ('price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Price')),
                ('duration', models.IntegerField(verbose_name='Duration (minutes)')),
                ('capacity', models.IntegerField(help_text='Maximum number of participants', verbose_name='Capacity')),
                ('difficulty', models.CharField(choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')], default='beginner', max_length=15, verbose_name='Difficulty Level')),
                ('is_active', models.BooleanField(default=True, verbose_name='Is Active')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='courses.coursecategory', verbose_name='Category')),
                ('instructor', models.ForeignKey(limit_choices_to={'role': 'staff'}, on_delete=django.db.models.deletion.CASCADE, related_name='taught_courses', to=settings.AUTH_USER_MODEL, verbose_name='Instructor')),
            ],
            options={
                'verbose_name': 'Course',
                'verbose_name_plural': 'Courses',
                'db_table': 'gym_course',
            },
        ),
        migrations.CreateModel(
            name='CourseSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField(verbose_name='Start Time')),
                ('end_time', models.DateTimeField(verbose_name='End Time')),
                ('location', models.CharField(max_length=100, verbose_name='Location')),
                ('current_capacity', models.IntegerField(default=0, verbose_name='Current Capacity')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedules', to='courses.course', verbose_name='Course')),
            ],
            options={
                'verbose_name': 'Course Schedule',
                'verbose_name_plural': 'Course Schedules',
                'db_table': 'gym_course_schedule',
            },
        ),
        migrations.CreateModel(
            name='CourseEnrollment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('enrolled', 'Enrolled'), ('cancelled', 'Cancelled'), ('completed', 'Completed')], default='enrolled', max_length=15, verbose_name='Status')),
                ('attendance', models.BooleanField(blank=True, null=True, verbose_name='Attendance')),
                ('feedback', models.TextField(blank=True, null=True, verbose_name='Feedback')),
                ('rating', models.IntegerField(blank=True, choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)], null=True, verbose_name='Rating')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Created At')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Updated At')),
                ('schedule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to='courses.courseschedule', verbose_name='Schedule')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to=settings.AUTH_USER_MODEL, verbose_name='User')),
            ],
            options={
                'verbose_name': 'Course Enrollment',
                'verbose_name_plural': 'Course Enrollments',
                'db_table': 'gym_course_enrollment',
            },
        ),
        # Add initial data
        migrations.RunPython(create_initial_data, remove_initial_data),
    ] 