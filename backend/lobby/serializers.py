from rest_framework import serializers
from .models import LobbyModel

class LobbyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LobbyModel
        fields = [
            'id',
            'host_id',
            'max_users',
        ]

