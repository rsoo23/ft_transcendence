from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import TournamentModel
from django.core.cache import cache
from .views import create_tournament
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

        tournament_info = json.loads(cache.get(f'tournament-info-{tournament.id}'))
        self.lobby_id = tournament_info['lobby_id']
        self.bracket = 1
        self.opponent = None
        self.group_tournament = f'tournament-{self.tournament_id}'
        self.is_host = (self.scope['user'] == model.host)
        if self.is_host:
            self.tournament_pairs = tournament_info['pairs']
            self.tournament_brackets = tournament_info['brackets']

        await self.accept('Authorization')

    async def disconnect(self, code):
        # in case user fails to join early on
        if not hasattr(self, 'group_tournament'):
            return

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

    async def tournament_notify_left(self, event):
        await self.send_json({
            'event': 'left',
            'user': event['user'],
        })
