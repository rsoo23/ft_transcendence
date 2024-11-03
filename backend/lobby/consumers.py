from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import LobbyModel
from django.core.cache import cache
from pong.views import create_match
import json

class LobbyConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if self.scope['user'] is None:
            print(f'LobbyConsumer: User not authenticated.')
            await self.close(code=3000, reason='Not Authenticated')
            return

        self.user_id = self.scope['user'].id
        self.lobby_id = int(self.scope['url_route']['kwargs']['lobby_id'])
        try:
            model = await LobbyModel.objects.aget(id=self.lobby_id, closed=False)

        except Exception as e:
            print('LobbyConsumer: Exception while trying to get LobbyModel: ' + str(e))
            await self.close(code=3000, reason='No such lobby')
            return

        self.group_lobby = f'lobby-{self.lobby_id}'
        self.is_host = (self.user_id == model.host_id)
        if not self.is_host:
            await self.channel_layer.group_send(self.group_lobby, {
                'type': 'lobby.notify.join',
                'user': self.user_id,
            })

        else:
            users = []
            users.append({'id': self.user_id, 'ready': False})
            cache.set(self.group_lobby, json.dumps(users))

        await self.channel_layer.group_add(self.group_lobby, self.channel_name)
        await self.accept('Authorization')
        await self.channel_layer.send(self.channel_name, {'type': 'lobby.get.list'})

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_lobby, self.channel_name)

        if self.is_host:
            cache.delete(self.group_lobby)
            await self.channel_layer.group_send(self.group_lobby, {'type': 'lobby.notify.close'})
            model = await LobbyModel.objects.aget(id=self.lobby_id)
            model.closed = True
            await model.asave()

        else:
            await self.channel_layer.group_send(self.group_lobby, {
                'type': 'lobby.notify.left',
                'user': self.user_id,
            })

    async def receive_json(self, content):
        if 'action' not in content or 'value' not in content:
            return

        match content['action']:
            case 'ready':
                self.ready = content['value']
                await self.channel_layer.group_send(self.group_lobby, {
                    'type': 'lobby.notify.ready',
                    'user': self.user_id,
                    'ready': content['value'],
                })

            case 'start':
                if not self.is_host:
                    return

                await self.channel_layer.group_send(self.group_lobby, {'type': 'lobby.notify.start'})
                match = await create_match_and_game(player1_uuid, player2_uuid, False)
                await self.channel_layer.group_send(self.group_lobby, {
                    'type': 'lobby.notify.match',
                    'id': match.id
                })

            case 'stop':
                if not self.is_host:
                    return

                await self.channel_layer.group_send(self.group_lobby, {'type': 'lobby.notify.close'})

    async def lobby_get_list(self, event):
        await self.send_json({
            'event': 'list',
            'list': json.loads(cache.get(self.group_lobby)),
        })

    async def lobby_notify_left(self, event):
        await self.send_json({
            'event': 'left',
            'user': event['user'],
        })

    async def lobby_notify_join(self, event):
        if self.is_host:
            users = json.loads(cache.get(self.group_lobby))
            users.append({'id': event['user'], 'ready': False})
            cache.set(self.group_lobby, json.dumps(users))

        await self.send_json({
            'event': 'join',
            'user': event['user'],
        })

    async def lobby_notify_ready(self, event):
        if self.is_host:
            users = json.loads(cache.get(self.group_lobby))
            for i in users:
                if i.id != event['user']:
                    continue

                i.ready = event['ready']

            cache.set(self.group_lobby, json.dumps(users))

        await self.send_json({
            'event': 'ready',
            'user': event['user'],
            'ready': event['ready'],
        })

    async def lobby_notify_start(self, event):
        await self.send_json({'event': 'start'})

    async def lobby_notify_close(self, event):
        await self.close(reason='Lobby closed :<')

    async def lobby_notify_match(self, event):
        await self.send_json({
            'event': 'match',
            'id': event['id'],
        })

    async def lobby_notify_tournament(self, event):
        await self.send_json({
            'event': 'tournament',
            'id': event['id'],
        })
