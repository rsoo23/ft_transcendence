from django.urls import path
from .views import (
    get_sent_friend_requests,
    get_received_friend_requests,
    get_friends,
    get_blocked_friends,
    get_non_friends,
)

urlpatterns = [
    path('sent_friend_requests/', get_sent_friend_requests, name='sent-friend-requests'),
    path('received_friend_requests/', get_received_friend_requests, name='received-friend-requests'),
    path('friends/', get_friends, name='get-friends'),
    path('blocked_friends/', get_blocked_friends, name='get-blocked-friends'),
    path('non_friends/', get_non_friends, name='non-friends'),
]
