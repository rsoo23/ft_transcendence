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
from django.urls import path, re_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')

from realtime_chat.jwt_middleware import JWTAuthMiddleware
from realtime_chat.consumers import ChatConsumer
from friends_system.consumers import FriendsSystemConsumer
from pong.consumers import PongConsumer
from lobby.consumers import LobbyConsumer, LobbyListConsumer
from user_management.consumers import UserUpdateConsumer
from tournament.consumers import TournamentConsumer

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        JWTAuthMiddlewareStack(
            URLRouter([
                path("ws/chat/<int:receiver_id>/", ChatConsumer.as_asgi()),
                path("ws/friends_system/", FriendsSystemConsumer.as_asgi()),
                path("ws/lobby/<int:lobby_id>", LobbyConsumer.as_asgi()),
                path("ws/lobby_list/", LobbyListConsumer.as_asgi()),
                re_path(r'ws/pong/(?P<match_id>[0-9]+)$', PongConsumer.as_asgi()),
                path("ws/user_update/", UserUpdateConsumer.as_asgi()),
                path("ws/tournament/<int:tournament_id>", TournamentConsumer.as_asgi()),
            ])
        )
    ),
})

ASGI_APPLICATION = 'main.asgi.application'
