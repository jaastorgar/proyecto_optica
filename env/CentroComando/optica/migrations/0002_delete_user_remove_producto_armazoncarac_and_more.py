# Generated by Django 5.0.7 on 2024-07-15 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('optica', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='User',
        ),
        migrations.RemoveField(
            model_name='producto',
            name='armazoncarac',
        ),
        migrations.RemoveField(
            model_name='producto',
            name='descripcion',
        ),
        migrations.RemoveField(
            model_name='producto',
            name='id',
        ),
        migrations.AddField(
            model_name='producto',
            name='armazon',
            field=models.CharField(default='default', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='producto',
            name='caracteristica',
            field=models.TextField(default='anchos', max_length=1000),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='producto',
            name='color_armazon',
            field=models.CharField(default='negros', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='producto',
            name='color_cristal',
            field=models.CharField(default='transparentes', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='producto',
            name='forma_marco',
            field=models.CharField(default='cuadrados', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='producto',
            name='genero',
            field=models.CharField(default='M', max_length=20),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='producto',
            name='marca',
            field=models.CharField(default='Armani', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='producto',
            name='codigo',
            field=models.CharField(max_length=10, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='producto',
            name='precio',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='producto',
            name='stock',
            field=models.IntegerField(),
        ),
    ]
