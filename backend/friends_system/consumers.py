import json

from django.core.cache import cache
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from realtime_chat.models import Room
from user_management.models import CustomUser
from user_management.serializers import CustomUserSerializer
from .serializers import FriendRequestSerializer, FriendRequestCreateSerializer
from .models import FriendList, FriendRequest

from rest_framework import status

class FriendsSystemConsumer(WebsocketConsumer):
    def connect(self):
        self.current_user_id = self.scope['user'].id
        self.current_user = CustomUser.objects.get(pk=self.current_user_id)

        if not self.scope['user'].is_authenticated:
            self.close()
            return

        cache.set(f'{self.current_user_id}', self.channel_name)

        self.accept()

    def disconnect(self, close_code):
        cache.delete(f'{self.current_user_id}')

    def receive(self, text_data=None, bytes_data=None):
        if not self.scope['user'].is_authenticated:
            self.close()
            return

        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        match action:
            case "send_friend_request":
                receiver_id = text_data_json['receiver_id']
                self.send_friend_request(receiver_id)
            case "cancel_friend_request":
                receiver_id = text_data_json['receiver_id']
                self.cancel_friend_request(receiver_id)
            case "accept_friend_request":
                sender_id = text_data_json['sender_id']
                self.accept_friend_request(sender_id)
            case "decline_friend_request":
                sender_id = text_data_json['sender_id']
                self.decline_friend_request(sender_id)
            case "block_friend":
                blocked_id = text_data_json['blocked_id']
                self.block_friend(blocked_id)
            case "unblock_friend":
                unblocked_id = text_data_json['unblocked_id']
                self.unblock_friend(unblocked_id)

    def send_friend_request(self, receiver_id):
        receiver = CustomUser.objects.get(pk=receiver_id)

        try:
            FriendRequest.objects.get(sender=self.current_user, receiver=receiver, is_active=True)
        except FriendRequest.DoesNotExist:
            serializer = FriendRequestCreateSerializer(data={
                "sender": self.current_user_id,
                "receiver": receiver.id
            })
            if serializer.is_valid():
                serializer.save()
                self.send_to_target_channel(
                    receiver_id,
                    'friend_request_received',
                    f'{self.current_user} sent you a friend request'
                )
                self.send_to_client_channel(
                    'friend_request_sent',
                    f'Sent friend request to {receiver.username}'
                )

    def cancel_friend_request(self, receiver_id):
        receiver = CustomUser.objects.get(pk=receiver_id)

        friend_request = FriendRequest.objects.get(sender=self.current_user, receiver=receiver, is_active=True)

        friend_request.cancel()

        self.send_to_target_channel(
            receiver_id,
            'friend_request_received_cancelled',
            f'{self.current_user} cancelled their friend request'
        )
        self.send_to_client_channel(
            'friend_request_sent_cancelled',
            f'Cancelled friend request to {receiver.username}'
        )

    def accept_friend_request(self, sender_id):
        sender = CustomUser.objects.get(pk=sender_id)

        friend_request = FriendRequest.objects.get(sender=sender, receiver=self.current_user, is_active=True)

        friend_request.accept()
        self.send_to_target_channel(
            sender_id,
            'friend_request_sent_accepted',
            f'{self.current_user} accepted your friend request'
        )
        self.send_to_client_channel(
            'friend_request_received_accepted',
            f'Accepted friend request from {sender.username}'
        )

    def decline_friend_request(self, sender_id):
        sender = CustomUser.objects.get(pk=sender_id)

        friend_request = FriendRequest.objects.get(sender=sender, receiver=self.current_user, is_active=True)

        friend_request.decline()
        self.send_to_target_channel(
            sender_id,
            'friend_request_sent_declined',
            f'{self.current_user} declined your friend request'
        )
        self.send_to_client_channel(
            'friend_request_received_declined',
            f'Declined friend request from {sender.username}'
        )

    def block_friend(self, blocked_id):
        current_user_friend_list = FriendList.objects.get(current_user=self.current_user)
        friend = CustomUser.objects.get(pk=blocked_id)

        current_user_friend_list.block_friend(friend)
        self.send_to_target_channel(
            blocked_id,
            'blocked_by_friend',
            f'{self.current_user} blocked you'
        )
        self.send_to_client_channel(
            'block_friend',
            f'Successfully blocked {friend.username}'
        )

    def unblock_friend(self, unblocked_id):
        current_user_friend_list = FriendList.objects.get(current_user=self.current_user)
        friend = CustomUser.objects.get(pk=unblocked_id)

        current_user_friend_list.unblock_friend(friend)
        self.send_to_target_channel(
            unblocked_id,
            'unblocked_by_friend',
            f'{self.current_user} unblocked you'
        )
        self.send_to_client_channel(
            'unblock_friend',
            f'Successfully unblocked {friend.username}'
        )

    def send_to_target_channel(self, target_id, action, message):
        target_channel = cache.get(f'{target_id}')
        if target_channel:
            async_to_sync(self.channel_layer.send)(
                target_channel,
                {
                    'type': 'action_send',
                    'action': action,
                    'sender_id': self.current_user_id,
                    'message': message,
                }
            )

    def send_to_client_channel(self, action, message):
        async_to_sync(self.channel_layer.send)(
            self.channel_name,
            {
                'type': 'action_acknowledge',
                'action': action,
                'message': message,
            }
        )

    def action_send(self, event):
        message = event['message']
        action = event['action']
        sender_id = event['sender_id']

        self.send(text_data=json.dumps({
            'action': action,
            'message': message,
            'sender_id': sender_id,
        }))

    def action_acknowledge(self, event):
        message = event['message']
        action = event['action']

        self.send(text_data=json.dumps({
            'action': action,
            'message': message,
        }))

