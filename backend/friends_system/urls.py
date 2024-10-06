from django.urls import path
from .views import send_friend_request, get_sent_friend_requests, get_received_friend_requests

urlpatterns = [
    path('send_friend_request/', send_friend_request, name='send-friend-request'),
    path('sent_friend_requests/', get_sent_friend_requests, name='sent-friend-requests'),
    path('received_friend_requests/', get_received_friend_requests, name='received-friend-requests'),
]
