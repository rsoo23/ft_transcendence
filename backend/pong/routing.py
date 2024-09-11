from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/pong/(?P<match_id>[0-9]+)$', consumers.PongConsumer.as_asgi()),
]
