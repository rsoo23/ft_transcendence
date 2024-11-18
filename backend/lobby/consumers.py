from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import LobbyModel
from django.core.cache import cache
from pong.views import create_match_and_game
from tournament.views import create_tournament
from asgiref.sync import sync_to_async
import json
import asyncio

GROUP_LOBBYLIST = 'lobbylist'

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
        self.max_users = model.max_users
        self.is_tournament = model.is_tournament
        self.is_host = (self.user_id == model.host_id)
        self.broadcast = True
        if not self.is_host:
            await self.channel_layer.group_send(self.group_lobby, {
                'type': 'lobby.notify.join',
                'user': self.user_id,
            })

        else:
            users = []
            users.append({'id': self.user_id, 'ready': False})
            cache.set(self.group_lobby, json.dumps(users))
            self.cache_lock = asyncio.Lock()
            await self.channel_layer.group_add('lobbyhost', self.channel_name)
            await self.channel_layer.group_send(GROUP_LOBBYLIST, {
                'type': 'lobby.receive.id',
                'id': self.lobby_id,
                'is_tournament': self.is_tournament,
            })

        await self.channel_layer.group_add(self.group_lobby, self.channel_name)
        await self.accept('Authorization')
        await self.channel_layer.send(self.channel_name, {'type': 'lobby.get.list'})

    async def disconnect(self, code):
        # in case user fails to join early on
        if not hasattr(self, 'group_lobby'):
            return

        await self.channel_layer.group_discard(self.group_lobby, self.channel_name)

        if self.is_host:
            await self.channel_layer.group_discard('lobbyhost', self.channel_name)
            cache.delete(self.group_lobby)
            await self.channel_layer.group_send(self.group_lobby, {'type': 'lobby.notify.close'})
            await self.channel_layer.group_send(GROUP_LOBBYLIST, {
                'type': 'lobby.remove.id',
                'id': self.lobby_id,
                'is_tournament': self.is_tournament,
            })
            model = await LobbyModel.objects.aget(id=self.lobby_id)
            model.closed = True
            await model.asave()

        else:
            await self.channel_layer.group_send(self.group_lobby, {
                'type': 'lobby.notify.left',
                'user': self.user_id,
            })

    async def receive_json(self, content):
        if 'action' not in content:
            return

        match content['action']:
            case 'ready':
                await self.channel_layer.group_send(self.group_lobby, {
                    'type': 'lobby.notify.ready',
                    'user': self.user_id,
                    'ready': content['value'],
                })

            case 'start':
                if not self.is_host:
                    return

                await self.channel_layer.group_send(self.group_lobby, {'type': 'lobby.notify.start'})
                self.broadcast = False
                await self.channel_layer.group_send(GROUP_LOBBYLIST, {
                    'type': 'lobby.remove.id',
                    'id': self.lobby_id,
                    'is_tournament': self.is_tournament,
                })
                if self.is_tournament:
                    async with self.cache_lock:
                        users = await self.get_lobby_info()
                        for user in users:
                            user['ready'] = False

                        cache.set(self.group_lobby, json.dumps(users))

                    print('creating tournament')
                    tournament = await sync_to_async(create_tournament)(self.lobby_id, self.scope['user'], users)
                    print('tournament done')
                    await self.channel_layer.group_send(self.group_lobby, {
                        'type': 'lobby.notify.tournament',
                        'id': tournament.id
                    })

                else:
                    users = await self.get_lobby_info()
                    match = await create_match_and_game(users[0]['id'], users[1]['id'], 'online_classic')
                    await self.channel_layer.group_send(self.group_lobby, {
                        'type': 'lobby.notify.match',
                        'id': match.id,
                        'p1': users[0]['id'],
                        'p2': users[1]['id'],
                    })

            case 'stop':
                if not self.is_host:
                    return

                await self.channel_layer.group_send(self.group_lobby, {'type': 'lobby.notify.close'})

    async def get_lobby_info(self):
        info = cache.get(self.group_lobby)
        if not info:
            await self.close(code=4001, reason='Lobby closed')

        return json.loads(info)

    # this is to allow LobbyListConsumer to get all available lobbies
    async def lobby_get_id(self, event):
        if not self.is_host:
            return

        users = await self.get_lobby_info()
        if len(users) >= self.max_users or not self.broadcast:
            return

        await self.channel_layer.send(event['channel'], {
            'type': 'lobby.receive.id',
            'id': self.lobby_id,
            'is_tournament': self.is_tournament,
        })

    async def lobby_get_list(self, event):
        await self.send_json({
            'event': 'list',
            'list': await self.get_lobby_info(),
        })

    async def lobby_notify_left(self, event):
        await self.send_json({
            'event': 'left',
            'user': event['user'],
        })

        if not self.is_host:
            return

        async with self.cache_lock:
            users = await self.get_lobby_info()
            if len(users) >= self.max_users:
                await self.channel_layer.group_send(GROUP_LOBBYLIST, {
                        'type': 'lobby.receive.id',
                        'id': self.lobby_id,
                        'is_tournament': self.is_tournament,
                    })

            for i in users:
                if i['id'] != event['user']:
                    continue

                users.remove(i)
                break

            cache.set(self.group_lobby, json.dumps(users))

    async def lobby_notify_join(self, event):
        await self.send_json({
            'event': 'join',
            'user': event['user'],
        })

        if not self.is_host:
            return

        async with self.cache_lock:
            users = await self.get_lobby_info()
            # check if lobby is already full
            if len(users) >= self.max_users:
                await self.channel_layer.group_send(self.group_lobby, {
                    'type': 'lobby.notify.kick',
                    'user': event['user'],
                })

            users.append({'id': event['user'], 'ready': False, 'in_match': False})
            cache.set(self.group_lobby, json.dumps(users))
            if len(users) >= self.max_users:
                await self.channel_layer.group_send(GROUP_LOBBYLIST, {
                    'type': 'lobby.remove.id',
                    'id': self.lobby_id,
                    'is_tournament': self.is_tournament,
                })

    async def lobby_notify_ready(self, event):
        await self.send_json({
            'event': 'ready',
            'user': event['user'],
            'ready': event['ready'],
        })

        if not self.is_host:
            return

        async with self.cache_lock:
            users = await self.get_lobby_info()
            sender = None
            for i in users:
                if i['id'] != event['user']:
                    continue

                i['ready'] = event['ready']
                sender = i
                break

            # is this sent by TournamentConsumer?
            if event['ready'] and 'opponent' in event and event['opponent']:
                opponent = None
                for i in users:
                    if i['id'] != event['opponent']['id']:
                        continue

                    opponent = i
                    break

                if opponent['ready']:
                    sender['in_match'] = True
                    opponent['in_match'] = True
                    match = await create_match_and_game(
                        sender['id'],
                        opponent['id'],
                        'online_tournament',
                        event['tournament_id'],
                        { 'tournament_round': event['tournament_round'] },
                    )
                    await self.channel_layer.group_send(self.group_lobby, {
                        'type': 'lobby.notify.match',
                        'id': match.id,
                        'p1': sender['id'],
                        'p2': opponent['id'],
                    })

            cache.set(self.group_lobby, json.dumps(users))

    async def lobby_notify_start(self, event):
        await self.send_json({'event': 'start'})

    async def lobby_notify_close(self, event):
        await self.close(code=4001, reason='Lobby closed')

    async def lobby_notify_kick(self, event):
        if self.user_id == event['user']:
            await self.close(code=4002, reason='Lobby full')

    async def lobby_notify_match(self, event):
        await self.send_json({
            'event': 'match',
            'id': event['id'],
            'p1': event['p1'],
            'p2': event['p2'],
        })

    async def lobby_notify_tournament(self, event):
        await self.send_json({
            'event': 'tournament',
            'id': event['id'],
        })

class LobbyListConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if self.scope['user'] is None:
            print(f'LobbyListConsumer: User not authenticated.')
            await self.close(code=3000, reason='Not Authenticated')
            return

        isTournamentIndex = self.scope['subprotocols'].index('IsTournament') if 'IsTournament' in self.scope['subprotocols'] else None
        self.is_tournament = (
            isTournamentIndex != None
            and isTournamentIndex + 1 < len(self.scope['subprotocols'])
            and self.scope['subprotocols'][isTournamentIndex + 1] == 'true'
        )
        await self.channel_layer.group_add(GROUP_LOBBYLIST, self.channel_name)
        await self.accept('Authorization')

    async def disconnect(self, code):
        await self.channel_layer.group_discard(GROUP_LOBBYLIST, self.channel_name)

    async def receive_json(self, content):
        if 'action' not in content or content['action'] != 'get':
            return

        await self.channel_layer.group_send('lobbyhost', {
            'type': 'lobby.get.id',
            'channel': self.channel_name,
        })

    async def lobby_receive_id(self, event):
        if event['is_tournament'] != self.is_tournament:
            return

        await self.send_json({
            'event': 'receive',
            'id': event['id'],
        })

    async def lobby_remove_id(self, event):
        if event['is_tournament'] != self.is_tournament:
            return

        await self.send_json({
            'event': 'remove',
            'id': event['id'],
        })
