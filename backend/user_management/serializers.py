from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAvatarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['avatar_img']

    def update(self, instance, validated_data):
        # Updating the profile image
        instance.avatar_img = validated_data.get('avatar_img', instance.avatar_img)
        instance.save()
        return instance

