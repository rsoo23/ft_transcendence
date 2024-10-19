import json
import pytz

from datetime import datetime

from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from .models import Room, Message
from user_management.models import CustomUser

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        self.sender = self.user
        self.sender_username = self.sender.username
        self.receiver_username = self.scope['url_route']['kwargs']['receiver_username']

        self.receiver = get_object_or_404(CustomUser, username=self.receiver_username)

        # create the roon_name dynamically based on the sender's and receiver's username
        if self.sender_username < self.receiver_username:
            self.room_name = f'chat_{self.sender_username}_{self.receiver_username}'
        else:
            self.room_name = f'chat_{self.receiver_username}_{self.sender_username}'

        # get or create a room
        self.room, created = Room.objects.get_or_create(name=self.room_name)

        # get the sender and receiver and add them to the room
        self.room.users.add(self.sender, self.receiver)

        async_to_sync(self.channel_layer.group_add)(
            self.room_name,
            self.channel_name,
        )
        self.accept()

    def disconnect(self, close_code):
        if self.user.is_authenticated:
            async_to_sync(self.channel_layer.group_discard)(
                self.room_name,
                self.channel_name,
            )

    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender_username = text_data_json['sender_username']

        if self.user.is_authenticated:
            new_message = Message.objects.create(user=self.user, room=self.room, content=message)

            timezone = pytz.timezone('Asia/Singapore')
            localized_timestamp = new_message.timestamp.astimezone(timezone)
            formatted_timestamp = localized_timestamp.strftime('%d %b %Y - %H:%M')

            # send private message to the target
            async_to_sync(self.channel_layer.group_send)(
                self.room_name,
                {
                    'type': 'private_message',
                    'message': message,
                    'sender_username': sender_username,
                    'timestamp': formatted_timestamp,
                }
            )

    def private_message(self, event):
        message = event['message']
        sender_username = event['sender_username']
        timestamp = event['timestamp']

        # send the message to the Websocket client
        self.send(text_data=json.dumps({
            'message': message,
            'sender_username': sender_username,
            'timestamp': timestamp,
        }))

