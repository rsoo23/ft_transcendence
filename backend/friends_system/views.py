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
    # 5. is staff (admin)
    non_friends = all_users.exclude(id__in=friends)\
                            .exclude(id__in=requests_receivers)\
                            .exclude(id__in=requests_senders)\
                            .exclude(id=current_user.id)\
                            .exclude(is_staff=True)

    serializer = CustomUserSerializer(non_friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

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

# Get all friends in current user's friend list
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    current_user_friend_list = get_object_or_404(FriendList, current_user=request.user)

    friends = current_user_friend_list.friends.all()

    blocked_friends = current_user_friend_list.blocked_friends.all()

    # exclude all blocked friends
    friends = friends.exclude(id__in=blocked_friends)

    serializer = CustomUserSerializer(friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get all blocked friends in current user's friend list
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blocked_friends(request):
    current_user_friend_list = get_object_or_404(FriendList, current_user=request.user)

    blocked_friends = current_user_friend_list.blocked_friends.all()

    serializer = CustomUserSerializer(blocked_friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

