from asgiref.sync import async_to_sync
from channels.exceptions import AcceptConnection, DenyConnection
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class PongConsumer(AsyncWebsocketConsumer):
    async def websocket_connect(self, message):
        try:
            await self.connect(message)
        except AcceptConnection:
            await self.accept()
        except DenyConnection:
            await self.deny()

    async def connect(self, message):
        print(message)
        await self.channel_layer.group_add('ponggroup', self.channel_name)

        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'ponggroup', self.channel_name
        )

    async def receive(self, text_data):
        input_data = json.loads(text_data)
        print(input_data)
        await self.channel_layer.group_send(
            'ponggroup', {'type': 'pong.message', 'message': 'hello'}
        )

    async def pong_message(self, event):
        message = event['message']
        await self.send(text_data=message)
