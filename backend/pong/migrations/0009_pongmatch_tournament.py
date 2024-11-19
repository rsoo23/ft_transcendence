# Generated by Django 5.0.7 on 2024-11-11 11:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0008_remove_pongmatch_local'),
        ('tournament', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pongmatch',
            name='tournament',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tournament', to='tournament.tournamentmodel'),
        ),
    ]