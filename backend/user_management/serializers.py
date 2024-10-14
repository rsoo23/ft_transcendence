from rest_framework import serializers
from django.contrib.auth import get_user_model
from user_management.models import CustomUser

class UserAvatarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['avatar_img']
