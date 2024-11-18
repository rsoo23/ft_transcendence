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
        self.opponent = None
        self.is_loser = False
        self.group_lobby = f'lobby-{self.lobby_id}'
        self.group_tournament = f'tournament-{self.tournament_id}'
        self.is_host = (self.scope['user'] == model.host)

        info = json.loads(cache.get(f'tournament-info-{self.tournament_id}'))
        for round in info['list']:
            for pair in round:
                if (pair['player1'] and pair['player1']['id'] == self.user_id) or (pair['player2'] and pair['player2']['id'] == self.user_id):
                    self.round = info['rounds'] - pair['round'] + 1

        if not hasattr(self, 'round'):
            await self.close(code=3000, reason='Not in tournament')

        print(f'{self.user_id}: {self.round}')

        await self.channel_layer.group_add(self.group_tournament, self.channel_name)
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
                await self.channel_layer.group_send(self.group_lobby, {
                    'type': 'lobby.notify.ready',
                    'user': self.user_id,
                    'opponent': self.opponent,
                    'tournament_id': self.tournament_id,
                    'tournament_round': self.round,
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

    async def find_pair_by_user_id(self, rounds, user_id, round_num):
        for pair in rounds[round_num - 1]:
            if (
                (not pair['player1'] or pair['player1']['id'] != user_id)
                and (not pair['player2'] or pair['player2']['id'] != user_id)
            ):
                continue

            return pair

        return None

    async def tournament_get_info(self, event):
        info = json.loads(cache.get(f'tournament-info-{self.tournament_id}'))
        # if for some reason self.round goes out of bounds
        self.round = info['rounds'] if self.round > info['rounds'] else self.round
        pair = await self.find_pair_by_user_id(info['list'], self.user_id, self.round)
        if not pair:
            return

        if not self.is_loser:
            if pair['player1'] and pair['player1']['id'] == self.user_id:
                self.opponent = pair['player2']

            elif pair['player2'] and pair['player2']['id'] == self.user_id:
                self.opponent = pair['player1']

        else:
            self.opponent = None

        await self.send_json({
            'event': 'info',
            'info': info,
            'opponent': self.opponent,
        })

    async def tournament_notify_left(self, event):
        await self.send_json({
            'event': 'left',
            'user': event['user'],
        })

    async def tournament_notify_match(self, event):
        await self.send_json({
            'event': 'match',
            'id': id,
        })

    async def tournament_notify_lose(self, event):
        self.is_loser = True
        self.opponent = None
        await self.send_json({
            'event': 'lose',
            'user': event['user'],
        })

    async def tournament_match_end(self, event):
        if event['winner_id'] == self.user_id:
            self.round += 1

        if self.opponent and event['winner_id'] == self.opponent['id']:
            await self.channel_layer.group_send(self.group_tournament, {
                'type': 'tournament.notify.lose',
                'user': self.user_id,
            })

        if not self.is_host:
            return

        info = json.loads(cache.get(f'tournament-info-{self.tournament_id}'))
        rounds = info['list']
        pair = await self.find_pair_by_user_id(rounds, event['winner_id'], event['round'])
        winner = pair['player1'] if pair['player1'] and pair['player1']['id'] == event['winner_id'] else pair['player2']
        pair['winner'] = winner

        # because the rounds are inverted :]
        if pair['round'] <= 1:
            cache.set(f'tournament-info-{self.tournament_id}', json.dumps(info))
            await self.channel_layer.group_send(self.group_tournament, { 'type': 'tournament.get.info' })
            await self.channel_layer.group_send(self.group_tournament, {
                'type': 'tournament.notify.winner',
                'user': winner['id'],
            })
            return

        await self.channel_layer.group_send(self.group_lobby, {
            'type': 'lobby.notify.ready',
            'user': winner['id'],
            'ready': False,
        })
        round_index = info['rounds'] - pair['round'] + 1
        pair_index = pair['next_round_pair'] - 1
        player_slot = f'player{pair["next_pair_slot"]}'
        rounds[round_index][pair_index][player_slot] = winner
        cache.set(f'tournament-info-{self.tournament_id}', json.dumps(info))

        await self.channel_layer.group_send(self.group_tournament, { 'type': 'tournament.get.info' })

    # a winner is you!
    async def tournament_notify_winner(self, event):
        await self.send_json({
            'event': 'winner',
            'user': event['user'],
        })
