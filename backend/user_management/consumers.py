
import json

from django.core.cache import cache
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from realtime_chat.models import Room
from user_management.models import CustomUser

from rest_framework import status

class UserUpdateConsumer(WebsocketConsumer):
    def connect(self):
        if not self.scope['user'].is_authenticated:
            self.close()
            return

        self.current_user_id = self.scope['user'].id
        self.current_user = CustomUser.objects.get(pk=self.current_user_id)

        self.room_name = 'user_updates'

        async_to_sync(self.channel_layer.group_add)(
            self.room_name,
            self.channel_name,
        )
        self.accept('Authorization')

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_name,
            self.channel_name,
        )

    def receive(self, text_data=None, bytes_data=None):
        if not self.scope['user'].is_authenticated:
            self.close()
            return

        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        match action:
            case "update_username":
                new_username = text_data_json['new_username']
                self.update_username(new_username)
            case "update_online_status":
                blocked_id = text_data_json['blocked_id']
                self.block_friend(blocked_id)

    def update_username(self, new_username):
        if CustomUser.objects.filter(username=new_username).exclude(pk=request.user.pk).exists():
            pass

        self.current_user.username = new_username
        self.current_user.save()

        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {
                'type': 'broadcast_username_update',
                'new_username': new_username,
            }
        )

    def broadcast_username_update(self, event):
        sender_username = event['new_username']

        self.send(text_data=json.dumps({
            'user_id': self.current_user_id,
            'new_username': sender_username,
        }))

    def update_online_status(self, is_online):
        pass
        self.current_user.is_online = is_online
        self.current_user.save()

        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {
                'type': 'broadcast_user_online_status',
                'is_online': is_online,
            }
        )

    def broadcast_user_online_status(self, event):
        pass
        sender_username = event['new_username']

        self.send(text_data=json.dumps({
            'user_id': self.current_user_id,
            'is_online': is_online,
        }))

