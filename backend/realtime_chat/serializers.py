from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='user.username', read_only=True)
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'sender_username',
            'room',
            'content',
            'timestamp',
        ]

    def get_timestamp(self, obj):
        original_timestamp = obj.timestamp

        return original_timestamp.strftime('%d %b %Y - %H:%M')
