import json

from django.shortcuts import get_object_or_404

from user_management.models import CustomUser
from user_management.serializers import CustomUserSerializer
from .serializers import FriendRequestSerializer, FriendRequestCreateSerializer
from .models import FriendList, FriendRequest

from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_non_friends(request):
    current_user = request.user

    try:
        friend_list = FriendList.objects.get(current_user=current_user)
    except FriendList.DoesNotExist:
        return Response({"error": "FriendList does not exist"}, status=status.HTTP_404_NOT_FOUND)

    all_users = CustomUser.objects.all()

    friends = friend_list.friends.all()

    # gets the ids of the receivers of requests sent by current user
    sent_requests = FriendRequest.objects.filter(sender=request.user, is_active=True)
    requests_receivers = sent_requests.values_list('receiver__id', flat=True)

    # gets the ids of the request senders to current user
    received_requests = FriendRequest.objects.filter(receiver=request.user, is_active=True)
    requests_senders = received_requests.values_list('sender__id', flat=True)

    # exclude:
    # 1. all added friends
    # 2. receivers of current user's friend request
    # 3. senders of friend request to current user
    # 4. current user
    non_friends = all_users.exclude(id__in=friends).exclude(id__in=requests_receivers).exclude(id__in=requests_senders).exclude(id=current_user.id)

    serializer = CustomUserSerializer(non_friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    sender_id = request.user.id
    receiver_username = request.data.get("receiver_username")
    if not receiver_username:
        return Response({"error": "Receiver username is required."}, status=status.HTTP_400_BAD_REQUEST)

    receiver = get_object_or_404(CustomUser, username=receiver_username)

    existing_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active=True).exists()
    if existing_request:
        return Response({"error": "An active friend request already exists."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = FriendRequestCreateSerializer(data={
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

# Cancel friend request that current user has sent
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_friend_request(request):
    sender_id = request.user.id
    receiver_username = request.data.get("receiver_username")
    if not receiver_username:
        return Response({"error": "Receiver username is required."}, status=status.HTTP_400_BAD_REQUEST)

    receiver = get_object_or_404(CustomUser, username=receiver_username)

    friend_request = get_object_or_404(FriendRequest, sender=request.user, receiver=receiver, is_active=True)

    friend_request.cancel()
    return Response({"message": "Friend request cancelled successfully."}, status=status.HTTP_200_OK)

