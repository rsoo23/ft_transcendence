from django.shortcuts import render, get_object_or_404

from .models import Room, Message
from user_management.models import CustomUser
from friends_system.models import FriendList
from .serializers import MessageSerializer

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request):
    current_user = request.user
    sender_username = current_user.username

    receiver_id = request.query_params.get('receiver_id')
    receiver = get_object_or_404(CustomUser, pk=receiver_id)
    receiver_username = receiver.username

    # generates the room name dynamically based on their usernames in alphabetical order
    if sender_username < receiver_username:
        room_name = f'chat_{sender_username}_{receiver_username}'
    else:
        room_name = f'chat_{receiver_username}_{sender_username}'

    room, created = Room.objects.get_or_create(name=room_name)

    # get the all the messages in this room
    messages = Message.objects.filter(room=room)

    # serialize the messages
    serializer = MessageSerializer(messages, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_friend_blocked(request):
    sender = request.user

    receiver_id = request.query_params.get('receiver_id')
    receiver = get_object_or_404(CustomUser, pk=receiver_id)

    receiver_friend_list = get_object_or_404(FriendList, current_user=receiver)

    if (receiver_friend_list.is_blocked_friend(sender)):
        return Response({ "is_blocked": "true" }, status=status.HTTP_403_FORBIDDEN)

    return Response({ "is_blocked": "false" }, status=status.HTTP_200_OK)

