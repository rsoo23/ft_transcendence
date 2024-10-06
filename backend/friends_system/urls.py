from django.urls import path
from .views import SendFriendRequestView, GetSentFriendRequestsView, GetReceivedFriendRequestsView

urlpatterns = [
    path('send_friend_request/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('sent_friend_requests/', GetSentFriendRequestsView.as_view(), name='sent-friend-requests'),
    path('received_friend_requests/', GetReceivedFriendRequestsView.as_view(), name='received-friend-requests'),
]
