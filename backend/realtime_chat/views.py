from django.shortcuts import render, get_object_or_404

from .models import Room, Message
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
    receiver_username = request.query_params.get('receiver_username')

    # generates the room name dynamically based on their usernames in alphabetical order
    if sender_username < receiver_username:
        room_name = f'chat_{sender_username}_{receiver_username}'
    else:
        room_name = f'chat_{receiver_username}_{sender_username}'

    room = get_object_or_404(Room, name=room_name)

    # get the all the messages in this room
    messages = Message.objects.filter(room=room)

    # serialize the messages
    serializer = MessageSerializer(messages, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)
