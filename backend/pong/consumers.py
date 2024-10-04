from channels.exceptions import AcceptConnection, DenyConnection
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import PongMatch
from .views import get_user_from_token
import json
import logging
from time import sleep
from multiprocessing import Process
from threading import Thread, Lock
from .game import GameLogic
import asyncio
from datetime import datetime

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
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
            print('user is host')
            await self.channel_layer.group_add(self.group_host, self.channel_name)
            self.input_lock = Lock()
            self.input_buffer = {'player1': '', 'player2': ''}
            self.game_info = GameLogic()
            self.p1_channel = self.channel_name
            self.p2_channel = ''
            self.game_thread = Thread(target=asyncio.run, args=(self.pong_game_loop(),))
            self.game_thread.start()
            # in case someone joined earlier than the host, ask all users in the group to resend join message
            await self.channel_layer.group_send(self.group_match, {'type': 'resend_player_join'})

        elif self.user_id == self.match_data.player2_uuid:
            await self.channel_layer.group_send(self.group_host, {'type': 'receive.player.join', 'id': self.user_id, 'channel_name': self.channel_name})

        else:
            await self.close(code=3000, reason='not implemented yet')
            return

        print(f'user with {self.user_id} joined')
        await self.accept()

    async def disconnect(self, code):
        # if the user_id attribute failed to exist, then the init didn't get that far
        if not hasattr(self, 'user_id'):
            return

        # handle host disconnect
        if hasattr(self, 'match_data') and self.user_id == self.match_data.player1_uuid:
            print(self.input_lock.locked())
            # NOTE: this is just a temporary way to stop the thread
            self.game_info.ended = True
            self.game_thread.join(10)

        await self.channel_layer.group_send(self.group_host, {'type': 'receive.player.leave', 'id': self.user_id})
        await self.channel_layer.group_discard(self.group_match, self.channel_name)

    async def receive(self, text_data):
        input_data = json.loads(text_data)
        print(input_data)
        await self.channel_layer.group_send(
            self.group_host, {
                'type': 'receive.player.input',
                'id': self.user_id,
                'input':  input_data['type'],
            }
        )

    # pongmatch handlers
    # expects: {}
    async def resend_player_join(self, event):
        await self.channel_layer.group_send(self.group_host, {'type': 'receive.player.join', 'id': self.user_id, 'channel_name': self.channel_name})

    async def send_player_update(self, event):
        await self.send(text_data='ticked!')

    # ponghost handlers
    # expects: {'id': <int>}
    async def receive_player_join(self, event):
        player_uuid = event['id']
        # if self.user_id == self.match_data.player1_uuid:
        if self.user_id == self.match_data.player1_uuid and player_uuid == self.match_data.player2_uuid:
            print('hi, this is your host speaking')
            print(f'p2 ch name is {event['channel_name']}')
            p2_channel = event['channel_name']

        # if self.user_id == self.match_data.player2_uuid:
        #     print('hi, this is your NOT host speaking')
        #     print(self.channel_name)

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

    # game thread loop
    # NOTE: this shouldn't be treated as a handler
    async def pong_game_loop(self):
        while self.game_info.ended == False:
            await self.channel_layer.send(self.p1_channel, {'type': 'send.player.update'})
            if self.p2_channel != '':
                await self.channel_layer.send(self.p2_channel, {'type': 'send.player.update'})
            # await self.channel_layer.group_send(self.group_host, {'type': 'send.player.update'})
            sleep(GameLogic.sec_per_frame)

        # self.game_info.tick()

