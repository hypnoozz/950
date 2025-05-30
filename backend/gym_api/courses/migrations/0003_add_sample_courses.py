from django.db import migrations
from django.utils import timezone
from datetime import timedelta

def add_sample_courses(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    CourseSchedule = apps.get_model('courses', 'CourseSchedule')
    User = apps.get_model('users', 'User')

    # Create categories
    categories = {
        'yoga': CourseCategory.objects.create(name='Yoga', description='Yoga classes for all levels'),
        'fitness': CourseCategory.objects.create(name='Fitness', description='General fitness classes'),
        'strength': CourseCategory.objects.create(name='Strength Training', description='Strength and muscle building classes'),
        'cardio': CourseCategory.objects.create(name='Cardio', description='Cardiovascular training classes'),
    }

    # Get or create a staff user for instructor
    instructor = User.objects.filter(role='staff').first()
    if not instructor:
        instructor = User.objects.create(
            username='instructor',
            email='instructor@example.com',
            role='staff',
            is_staff=True
        )

    # Create courses
    courses = {
        'yoga_basic': Course.objects.create(
            name='Basic Yoga',
            description='Introduction to yoga poses and breathing techniques',
            category=categories['yoga'],
            instructor=instructor,
            duration=60,
            capacity=20,
            price=50.00,
            difficulty='beginner',
            image='courses/yoga_basic.jpg'
        ),
        'fitness_basic': Course.objects.create(
            name='Basic Fitness',
            description='Introduction to fitness training',
            category=categories['fitness'],
            instructor=instructor,
            duration=45,
            capacity=15,
            price=40.00,
            difficulty='beginner',
            image='courses/fitness_basic.jpg'
        ),
        'strength_basic': Course.objects.create(
            name='Basic Strength Training',
            description='Introduction to strength training',
            category=categories['strength'],
            instructor=instructor,
            duration=60,
            capacity=10,
            price=55.00,
            difficulty='beginner',
            image='courses/strength_basic.jpg'
        ),
        'cardio_basic': Course.objects.create(
            name='Basic Cardio',
            description='Introduction to cardiovascular training',
            category=categories['cardio'],
            instructor=instructor,
            duration=45,
            capacity=20,
            price=45.00,
            difficulty='beginner',
            image='courses/cardio_basic.jpg'
        ),
    }

    # Create schedules
    now = timezone.now()
    schedules = [
        CourseSchedule.objects.create(
            course=courses['yoga_basic'],
            start_time=now + timedelta(days=1, hours=9),
            end_time=now + timedelta(days=1, hours=10),
            location='Studio A',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['yoga_basic'],
            start_time=now + timedelta(days=3, hours=9),
            end_time=now + timedelta(days=3, hours=10),
            location='Studio A',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['fitness_basic'],
            start_time=now + timedelta(days=2, hours=10),
            end_time=now + timedelta(days=2, hours=10, minutes=45),
            location='Studio B',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['fitness_basic'],
            start_time=now + timedelta(days=4, hours=10),
            end_time=now + timedelta(days=4, hours=10, minutes=45),
            location='Studio B',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['strength_basic'],
            start_time=now + timedelta(days=1, hours=14),
            end_time=now + timedelta(days=1, hours=15),
            location='Weight Room',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['strength_basic'],
            start_time=now + timedelta(days=3, hours=14),
            end_time=now + timedelta(days=3, hours=15),
            location='Weight Room',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['cardio_basic'],
            start_time=now + timedelta(days=2, hours=14),
            end_time=now + timedelta(days=2, hours=14, minutes=45),
            location='Studio C',
            current_capacity=0
        ),
        CourseSchedule.objects.create(
            course=courses['cardio_basic'],
            start_time=now + timedelta(days=4, hours=14),
            end_time=now + timedelta(days=4, hours=14, minutes=45),
            location='Studio C',
            current_capacity=0
        ),
    ]

def remove_sample_courses(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    CourseCategory = apps.get_model('courses', 'CourseCategory')
    CourseSchedule = apps.get_model('courses', 'CourseSchedule')

    CourseSchedule.objects.all().delete()
    Course.objects.all().delete()
    CourseCategory.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('courses', '0002_alter_courseenrollment_unique_together'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_sample_courses, remove_sample_courses),
    ] 