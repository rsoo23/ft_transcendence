"""
ASGI config for main project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from user_management.auth import JWTAuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from django.urls import path
from pong.routing import websocket_urlpatterns as pong_urlpatterns
from realtime_chat.consumers import ChatConsumer
from friends_system.consumers import FriendsSystemConsumer

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter([
                path("ws/chat/<int:receiver_id>/", ChatConsumer.as_asgi()),
                path("ws/friends_system/", FriendsSystemConsumer.as_asgi()),
            ] + pong_urlpatterns)
        )
    ),
})

ASGI_APPLICATION = 'main.asgi.application'
