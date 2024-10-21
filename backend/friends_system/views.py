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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    receiver_id = request.data.get("receiver_id")
    if not receiver_id:
        return Response({"error": "Receiver id is required."}, status=status.HTTP_400_BAD_REQUEST)

    receiver = get_object_or_404(CustomUser, pk=receiver_id)

    existing_active_request = FriendRequest.objects.filter(sender=request.user, receiver=receiver, is_active=True).exists()
    if existing_active_request:
        return Response({"error": "An active friend request already exists."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = FriendRequestCreateSerializer(data={
        "sender": request.user.id,
        "receiver": receiver.id
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

# Cancel friend request that current user has sent
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_friend_request(request):
    receiver_id = request.data.get("receiver_id")
    if not receiver_id:
        return Response({"error": "Receiver id is required."}, status=status.HTTP_400_BAD_REQUEST)

    receiver = get_object_or_404(CustomUser, pk=receiver_id)

    friend_request = get_object_or_404(FriendRequest, sender=request.user, receiver=receiver, is_active=True)

    friend_request.cancel()
    return Response({"message": "Friend request cancelled successfully."}, status=status.HTTP_200_OK)

# Accept friend request
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request):
    sender_id = request.data.get("sender_id")
    if not sender_id:
        return Response({"error": "Sender sender_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    sender = get_object_or_404(CustomUser, pk=sender_id)

    friend_request = get_object_or_404(FriendRequest, sender=sender, receiver=request.user, is_active=True)

    friend_request.accept()
    return Response({"message": "Friend request accepted successfully."}, status=status.HTTP_200_OK)

# Decline friend request
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def decline_friend_request(request):
    sender_id = request.data.get("sender_id")
    if not sender_id:
        return Response({"error": "Sender id is required."}, status=status.HTTP_400_BAD_REQUEST)

    sender = get_object_or_404(CustomUser, pk=sender_id)

    friend_request = get_object_or_404(FriendRequest, sender=sender, receiver=request.user, is_active=True)

    friend_request.decline()
    return Response({"message": "Friend request declined successfully."}, status=status.HTTP_200_OK)

# Block friend
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_friend(request):
    blocked_id = request.data.get("blocked_id")
    if not blocked_id:
        return Response({"error": "Blocked id is required."}, status=status.HTTP_400_BAD_REQUEST)

    current_user_friend_list = get_object_or_404(FriendList, current_user=request.user)
    friend = get_object_or_404(CustomUser, pk=blocked_id)

    current_user_friend_list.block_friend(friend)
    return Response({"message": "Friend blocked successfully."}, status=status.HTTP_200_OK)

# Unblock friend
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_friend(request):
    unblocked_id = request.data.get("unblocked_id")
    if not unblocked_id:
        return Response({"error": "Unblocked id is required."}, status=status.HTTP_400_BAD_REQUEST)

    current_user_friend_list = get_object_or_404(FriendList, current_user=request.user)
    friend = get_object_or_404(CustomUser, pk=unblocked_id)

    current_user_friend_list.unblock_friend(friend)
    return Response({"message": "Friend unblocked successfully."}, status=status.HTTP_200_OK)

