
# realtime_chat/urls.py
from django.urls import path

from .views import get_chat_messages

urlpatterns = [
    path('chat_messages/', get_chat_messages, name='get-chat-messages')
]
