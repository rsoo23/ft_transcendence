from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import PongMatch
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from asgiref.sync import sync_to_async
import logging
from .server import server_manager
import asyncio

class PongConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # check user
        if self.scope['user'] is None:
            print(f'PongConsumer: User not authenticated.')
            await self.close(code=3000, reason='Not Authenticated')
            return

        self.user_id = self.scope['user'].id
        self.match_id = int(self.scope['url_route']['kwargs']['match_id'])
        self.group_match = f'pongmatch-{self.match_id}'

        # check if PongMatch exists and hasn't ended
        try:
            self.match_data = await PongMatch.objects.aget(id=self.match_id, ended=False)

        except Exception as e:
            print('Exception while trying to get match_id: ' + str(e))
            await self.close(code=3000, reason='No such match')
            return

        # assign groups and set up user
        await self.channel_layer.group_add(self.group_match, self.channel_name)
        self.local_game = self.match_data.local

        if self.user_id == self.match_data.player1_uuid:
            self.player_num = 1

        elif self.user_id == self.match_data.player2_uuid:
            self.player_num = 2

        else:
            self.player_num = 0
            await self.close(code=3000, reason='not implemented yet')
            return

        if self.player_num != 0:
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, server_manager.update_player_consumer, self.match_id, self.player_num, self)

        print(f'user with {self.user_id} joined')
        await self.accept('Authorization')

    async def disconnect(self, code):
        # if the user_id attribute failed to exist, then the init didn't get that far
        if not hasattr(self, 'user_id'):
            return

        print(f'{self.user_id}: i am disconnecting! status {code}')
        await self.channel_layer.group_discard(self.group_match, self.channel_name)

        if not hasattr(self, 'player_num'):
            return

        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, server_manager.remove_player_consumer, self.match_id, self.player_num)

    async def receive_json(self, content):
        print(content)

        if content['type'] == 'input':
            if self.local_game:
                player_num = 2 if content['input'].find('p2_', 0, 3) != -1 else 1
            else:
                player_num = self.player_num

            content['input'] = content['input'][3:]
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, server_manager.update_player_input, self.match_id, player_num, content['input'], content['value'])
