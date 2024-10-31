from django.urls import path
from .views import (
    send_friend_request,
    get_sent_friend_requests,
    get_received_friend_requests,
    get_friends,
    get_blocked_friends,
    get_non_friends,
    cancel_friend_request,
    accept_friend_request,
    decline_friend_request,
    block_friend,
    unblock_friend,
)

urlpatterns = [
    path('send_friend_request/', send_friend_request, name='send-friend-request'),
    path('sent_friend_requests/', get_sent_friend_requests, name='sent-friend-requests'),
    path('received_friend_requests/', get_received_friend_requests, name='received-friend-requests'),
    path('friends/', get_friends, name='get-friends'),
    path('blocked_friends/', get_blocked_friends, name='get-blocked-friends'),
    path('non_friends/', get_non_friends, name='non-friends'),
    path('cancel_friend_request/', cancel_friend_request, name='cancel-friend-request'),
    path('accept_friend_request/', accept_friend_request, name='accept-friend-request'),
    path('decline_friend_request/', decline_friend_request, name='decline-friend-request'),
    path('block_friend/', block_friend, name='block_friend'),
    path('unblock_friend/', unblock_friend, name='unblock_friend'),
]
