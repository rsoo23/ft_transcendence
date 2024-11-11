from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import TournamentModel
from django.core.cache import cache
from .views import set_tournament_cache, clear_tournament_cache
from pong.views import create_match_and_game
import json

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        if self.scope['user'] is None:
            print(f'TournamentConsumer: User not authenticated.')
            await self.close(code=3000, reason='Not Authenticated')
            return

        self.user_id = self.scope['user'].id
        self.tournament_id = int(self.scope['url_route']['kwargs']['tournament_id'])
        try:
            model = await TournamentModel.objects.select_related('host').aget(id=self.tournament_id, closed=False)

        except Exception as e:
            print('TournamentConsumer: Exception while trying to get TournamentModel: ' + str(e))
            await self.close(code=3000, reason='No such tournament')
            return

        tournament_info = json.loads(cache.get(f'tournament-info-{self.tournament_id}'))
        self.lobby_id = tournament_info['lobby_id']
        self.round = 1
        self.opponent = None
        self.group_lobby = f'lobby-{self.lobby_id}'
        self.group_tournament = f'tournament-{self.tournament_id}'
        self.is_host = (self.scope['user'] == model.host)
        if self.is_host:
            self.tournament_pairs = tournament_info['pairs']
            self.tournament_rounds = tournament_info['rounds']

        else:
            self.tournament_set_ready(False)

        await self.accept('Authorization')
        await self.channel_layer.send(self.channel_name, { 'type': 'tournament.get.info' })

    async def disconnect(self, code):
        # in case user fails to join early on
        if not hasattr(self, 'group_tournament'):
            return

        if self.is_host:
            clear_tournament_cache(self.tournament_id)

        await self.channel_layer.group_discard(self.group_tournament, self.channel_name)
        await self.channel_layer.group_send(self.group_tournament, {
            'type': 'tournament.notify.left',
            'user': self.user_id,
        })

    async def receive_json(self, content):
        if 'action' not in content:
            return

        match content['action']:
            case 'ready':
                await self.channel_layer.group_send(self.group_tournament, {
                    'type': 'tournament.notify.ready',
                    'user': self.user_id,
                    'ready': content['value'],
                })

            # this should be polled every now and then?
            case 'opponent':
                if not self.opponent:
                    await self.send_json({
                        'event': 'opponent',
                        'opponent': self.opponent,
                    })
                    return

                users = json.loads(cache.get(self.group_lobby))
                for user in users:
                    if user['id'] != self.opponent:
                        continue

                    await self.send_json({
                        'event': 'opponent',
                        'opponent': self.opponent,
                    })
                    return

                self.opponent = None
                await self.send_json({
                    'event': 'opponent',
                    'opponent': self.opponent,
                })

    async def tournament_set_ready(self, ready):
        # TODO: use lobby's ready system?
        set_tournament_cache(self.tournament_id, f'tournament-ready-{self.user_id}', json.dumps(ready))

    async def tournament_get_ready(self, id):
        return json.loads(cache.get(f'tournament-ready-{id}'))

    async def tournament_get_info(self, event):
        info = json.loads(cache.get(f'tournament-info-{self.tournament_id}'))
        rounds = info['list']
        for pair in rounds[self.round - 1]:
            if (
                (not pair['player1'] or self.user_id not in pair['player1'].values())
                and (not pair['player2'] or self.user_id not in pair['player2'].values())
            ):
                continue

            if pair['player1'] and pair['player1']['id'] == self.user_id:
                self.opponent = pair['player2']

            elif pair['player2'] and pair['player2']['id'] == self.user_id:
                self.opponent = pair['player1']

        await self.send_json({
            'event': 'info',
            'info': info,
        })

    async def tournament_notify_left(self, event):
        await self.send_json({
            'event': 'left',
            'user': event['user'],
        })

    async def tournament_match_end(self, event):
        event['winner_id']

    async def tournament_notify_ready(self, event):
        if self.is_host:
            users = json.loads(cache.get(self.group_lobby))
            for i in users:
                if i['id'] != event['user']:
                    continue

                i['ready'] = event['ready']

            cache.set(self.group_lobby, json.dumps(users))

        await self.send_json({
            'event': 'ready',
            'user': event['user'],
            'ready': content['value'],
        })
