from rest_framework import serializers
from django.contrib.auth import get_user_model
from user_management.models import CustomUser
from .models import CustomUser

class UserAvatarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['avatar_img']

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'is_online',
            'first_name',
            'last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login',
            'two_factor_enabled',
            'groups',
            'user_permissions',
            'avatar_img',
        ]
