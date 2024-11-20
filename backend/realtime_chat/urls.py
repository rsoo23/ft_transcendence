
from django.urls import path

from .views import (
    get_chat_messages,
    is_friend_blocked,
)

urlpatterns = [
    path('chat_messages/', get_chat_messages, name='get-chat-messages'),
    path('is_friend_blocked/', is_friend_blocked, name='is-friend-blocked'),
]
