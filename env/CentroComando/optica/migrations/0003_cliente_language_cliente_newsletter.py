# Generated by Django 5.0.7 on 2024-07-19 04:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('optica', '0002_alter_cliente_rut'),
    ]

    operations = [
        migrations.AddField(
            model_name='cliente',
            name='language',
            field=models.CharField(choices=[('es', 'Español'), ('en', 'English')], default='es', max_length=2),
        ),
        migrations.AddField(
            model_name='cliente',
            name='newsletter',
            field=models.BooleanField(default=False),
        ),
    ]
