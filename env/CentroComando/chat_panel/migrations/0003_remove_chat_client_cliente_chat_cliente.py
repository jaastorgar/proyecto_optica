# Generated by Django 5.0.7 on 2024-08-08 18:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat_panel', '0002_customuser_alter_chat_assigned_to_alter_chat_client_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chat',
            name='client',
        ),
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('telefono', models.CharField(blank=True, max_length=15, null=True)),
                ('direccion', models.TextField(blank=True, null=True)),
                ('fecha_nacimiento', models.DateField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='cliente', to='chat_panel.customuser')),
            ],
        ),
        migrations.AddField(
            model_name='chat',
            name='cliente',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='chats', to='chat_panel.cliente'),
            preserve_default=False,
        ),
    ]
