# Generated by Django 5.0.7 on 2024-07-20 02:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('optica', '0005_alter_cita_cliente'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='is_customer',
            field=models.BooleanField(default=True),
        ),
    ]
