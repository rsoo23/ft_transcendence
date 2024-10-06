from django.urls import path
from .views import SendFriendRequestView

urlpatterns = [
    path('send_friend_request/', SendFriendRequestView.as_view(), name='send-friend-request'),
]
