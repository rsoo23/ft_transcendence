import json

from user_management.models import CustomUser
from .serializers import FriendRequestSerializer
from .models import FriendList, FriendRequest

from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    sender_id = request.user.id
    receiver_id = request.data.get("receiver_id")
    if not receiver_id:
        return Response({"error": "Receiver user ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        receiver = CustomUser.objects.get(pk=receiver_id)
    except CustomUser.DoesNotExist:
        return Response({"error": "Receiver user not found."}, status=status.HTTP_404_NOT_FOUND)

    existing_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active=True).first()
    if existing_request:
        return Response({"error": "An active friend request already exists."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = FriendRequestSerializer(data={
        "sender": sender_id,
        "receiver": receiver_id
    })
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Get all friend requests where the current user is the sender
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sent_friend_requests(request):
    sent_requests = FriendRequest.objects.filter(sender=request.user, is_active=True)
    serializer = FriendRequestSerializer(sent_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get all friend requests where the current user is the receiver
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_received_friend_requests(request):
    received_requests = FriendRequest.objects.filter(receiver=request.user, is_active=True)
    serializer = FriendRequestSerializer(received_requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
