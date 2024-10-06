from rest_framework import serializers
from .models import FriendRequest

class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ['sender', 'receiver']

    def create(self, validated_data):
        return FriendRequest.objects.create(**validated_data, is_active=True)
