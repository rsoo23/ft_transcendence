# Generated by Django 5.0.6 on 2024-10-10 01:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('realtime_chat', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='room',
            old_name='online',
            new_name='users',
        ),
        migrations.AlterField(
            model_name='message',
            name='content',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='room',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
