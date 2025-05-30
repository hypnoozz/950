from django.db import migrations

def add_membership_plans(apps, schema_editor):
    MembershipPlan = apps.get_model('orders', 'MembershipPlan')

    plans = [
        MembershipPlan.objects.create(
            name='Basic Plan',
            description='Basic membership with limited access',
            price=99.00,
            duration=30,
            benefits='Access to basic fitness equipment\nGroup classes (limited)\nLocker room access',
            is_active=True
        ),
        MembershipPlan.objects.create(
            name='Standard Plan',
            description='Standard membership with full access',
            price=199.00,
            duration=30,
            benefits='Access to all fitness equipment\nUnlimited group classes\nPersonal trainer consultation\nLocker room access\nTowel service',
            is_active=True
        ),
        MembershipPlan.objects.create(
            name='Premium Plan',
            description='Premium membership with VIP access',
            price=299.00,
            duration=30,
            benefits='Access to all fitness equipment\nUnlimited group classes\nPersonal trainer sessions\nLocker room access\nTowel service\nPriority booking\nNutrition consultation',
            is_active=True
        ),
    ]

def remove_membership_plans(apps, schema_editor):
    MembershipPlan = apps.get_model('orders', 'MembershipPlan')
    MembershipPlan.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0006_remove_membershipplan_max_sessions_and_more'),
    ]

    operations = [
        migrations.RunPython(add_membership_plans, remove_membership_plans),
    ] 