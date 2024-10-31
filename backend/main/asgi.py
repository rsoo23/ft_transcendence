"""
ASGI config for main project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')

django_asgi_app = get_asgi_application()

from realtime_chat.routing import websocket_urlpatterns as chat_urlpatterns
from pong.routing import websocket_urlpatterns as pong_urlpatterns
from realtime_chat.jwt_middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                chat_urlpatterns + pong_urlpatterns
            )
        )
    ),
    # "websocket": JWTAuthMiddleware(
    #     URLRouter(
    #         websocket_urlpatterns
    #     )
    # ),
})

ASGI_APPLICATION = 'realtime_chat.asgi.application'
