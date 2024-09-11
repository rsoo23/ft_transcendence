from channels.exceptions import AcceptConnection, DenyConnection
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import PongMatch
import json

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # check if PongMatch exists and hasn't ended
        try:
            self.match_id = self.scope['url_route']['kwargs']['match_id']
            self.match_group = f'pongmatch-{self.match_id}'
            match_data = await PongMatch.objects.aget(id=self.match_id, ended=False)

        except Exception as e:
            print('Exception while trying to get match_id: ' + str(e))
            await self.close(code=3000, reason='No such match')
            return

        await self.channel_layer.group_add(self.match_group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.match_group, self.channel_name
        )

    async def receive(self, text_data):
        input_data = json.loads(text_data)
        print(input_data)
        await self.channel_layer.group_send(
            self.match_group, {'type': 'pong.message', 'message': 'hello'}
        )

    async def pong_message(self, event):
        message = event['message']
        await self.send(text_data=message)
