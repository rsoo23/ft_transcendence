from channels.exceptions import AcceptConnection, DenyConnection
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import PongMatch
from .views import get_user_from_token
import logging
from time import sleep
from multiprocessing import Process
from threading import Thread, Lock
from .game import GameLogic
from .server import server_manager
import asyncio
from datetime import datetime

class PongConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.match_id = int(self.scope['url_route']['kwargs']['match_id'])
        self.group_match = f'pongmatch-{self.match_id}'
        self.group_host = f'pongmatch-{self.match_id}'

        # get user id
        try:
            # self.user_id = get_user_from_token()
            query_string = self.scope['query_string'].split(b'&')
            queries = dict(i.split(b'=') for i in query_string)
            self.user_id = int(queries[b'user'])

        except Exception as e:
            print('Exception while trying to get user_id: ' + str(e))
            await self.close(code=3000, reason='Invalid JWT')
            return

        # check if PongMatch exists and hasn't ended
        try:
            # print(self.scope)
            self.match_data = await PongMatch.objects.aget(id=self.match_id, ended=False)

        except Exception as e:
            print('Exception while trying to get match_id: ' + str(e))
            await self.close(code=3000, reason='No such match')
            return

        # assign groups and set up user
        await self.channel_layer.group_add(self.group_match, self.channel_name)

        if self.user_id == self.match_data.player1_uuid:
            self.player_num = 1
            print('user is host')
            await self.channel_layer.group_add(self.group_host, self.channel_name)

        elif self.user_id == self.match_data.player2_uuid:
            self.player_num = 2
            await self.channel_layer.group_send(self.group_host, {'type': 'receive.player.join', 'id': self.user_id})

        else:
            self.player_num = 0
            await self.close(code=3000, reason='not implemented yet')
            return

        if self.player_num != 0:
            server_manager.update_player_consumer(self.match_id, self.player_num, self)

        print(f'user with {self.user_id} joined')
        await self.accept()

    async def disconnect(self, code):
        # if the user_id attribute failed to exist, then the init didn't get that far
        if not hasattr(self, 'user_id'):
            return

        print(f'{self.user_id}: i am disconnecting!')
        await self.channel_layer.group_send(self.group_host, {'type': 'receive.player.leave', 'id': self.user_id})
        await self.channel_layer.group_discard(self.group_match, self.channel_name)

        # stop and delete the server
        loop = asyncio.get_running_loop()
        loop.create_task(server_manager.close_game(self.match_id))

    async def receive_json(self, content):
        print(content)

        if content['type'] == 'input':
            server_manager.update_player_input(self.match_id, self.player_num, content['input'], content['value'])

    # pongmatch handlers
    # async def send_player_update(self, event):
    #     await self.send(text_data='ticked!')

    # ponghost handlers
    # expects: {'id': <int>}
    async def receive_player_join(self, event):
        player_uuid = event['id']

        if self.user_id == self.match_data.player2_uuid:
            print('hi, this is your NOT host speaking')
            print(self.channel_name)

        # print(f'user with {player_uuid} joined')

    # expects: {'id': <int>}
    async def receive_player_leave(self, event):
        player_uuid = event['id']
        if event['id'] == self.match_data.player1_uuid:
            print('host left')

        print(f'user with {player_uuid} left')

    # expects: {'id': <int>, 'input': <string>}
    async def receive_player_input(self, event):
        # TODO: put this check somewhere better
        if event['id'] == self.match_data.player1_uuid:
            pass

        elif event['id'] == self.match_data.player2_uuid:
            pass

        print(f'got {event['id']} from {event['id']}')
