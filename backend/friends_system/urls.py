from django.urls import path
from .views import (
    send_friend_request,
    get_sent_friend_requests,
    get_received_friend_requests,
    get_non_friends,
    cancel_friend_request
)

urlpatterns = [
    path('send_friend_request/', send_friend_request, name='send-friend-request'),
    path('sent_friend_requests/', get_sent_friend_requests, name='sent-friend-requests'),
    path('received_friend_requests/', get_received_friend_requests, name='received-friend-requests'),
    path('non_friends/', get_non_friends, name='non-friends'),
    path('cancel_friend_request/', cancel_friend_request, name='cancel-friend-request'),
    path('accept_friend_request/', accept_friend_request, name='accept-friend-request'),
]
