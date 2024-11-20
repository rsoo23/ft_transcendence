from channels.layers import get_channel_layer
from threading import Thread, Lock
from asgiref.sync import async_to_sync
from .game.logic import GameLogic
from .models import PongMatch
from time import sleep, time_ns
import asyncio
from django.utils import timezone
from game_stats.models import MatchStats
import datetime

# NOTICE: due to how threading's Lock works, it's best to call every ServerManager method with run_in_executor
#         else you risk having your async function get stuck in purgatory (aka, the whole server freezes)
class ServerManager():
    def __init__(self):
        # supposedly, python's dicts are hashmaps, so this shouldn't be too bad
        self.matches = {}
        self.matches_lock = Lock()
        # not sure if this would be used, but it could be good for automating group messages
        self.channel_layer = get_channel_layer()

    # will do nothing if game already exists
    def try_create_game(self, match_id, group_match, local, info={}):
        with self.matches_lock:
            if match_id in self.matches:
                print(f'match with id {match_id} already exists!')
                return

            print(f'creating match with id {match_id}')
            self.matches[match_id] = {
                'game_info': GameLogic(info),
                'thread': Thread(target=self.main_loop, args=(match_id,)),
                'group_match': group_match,
                'local': local,
                'paused': False,
                'p1_consumer': None,
                'p2_consumer': None,
            }

    def get_game(self, match_id):
        try:
            with self.matches_lock:
                return self.matches[match_id]

        except Exception:
            print(f'server: game with id {match_id} does not exist')
            return None

    def start_game(self, match_id):
        match_info = self.get_game(match_id)
        if match_info == None:
            return

        match_info['thread'].start()

    # gently tries to stop the game
    def stop_game(self, match_id):
        match_info = self.get_game(match_id)
        if match_info == None:
            return

        match_info['game_info'].ended = True

    # NOTE: this forcifully ends the game, and the match is considered invalid
    # TODO: add another method that actually fits the note above
    # closes the game normally
    def close_game(self, match_id):
        print(f'server: ending game with id {match_id}!')
        try:
            with self.matches_lock:
                match_info = self.matches.pop(match_id)

        except Exception:
            print(f'server: game with id {match_id} does not exist')
            return

        print('checking thread')
        # we check if the game ended in the case that the thread is the one closing the game
        if match_info['thread'].is_alive() and not match_info['game_info'].ended:
            match_info['game_info'].ended = True
            match_info['thread'].join()

        p1_still_in = bool(match_info['p1_consumer'])
        p2_still_in = bool(match_info['p2_consumer'])

        # self.disconnect_consumers_from_game(match_id)
        if match_info['p1_consumer'] != None:
            async_to_sync(match_info['p1_consumer'].close)()

        if match_info['p2_consumer'] != None:
            async_to_sync(match_info['p2_consumer'].close)()

        # update pongmatch data
        print('getting match info')
        try: 
            match_data = PongMatch.objects.get(id=match_id)
            game_info = match_info['game_info']
            
            print('setting match info')
            match_data.p1_score = match_info['game_info'].score[0]
            match_data.p2_score = match_info['game_info'].score[1]
            match_data.ended = True
            match_data.save()

            if match_data.tournament != None and p1_still_in and p2_still_in:
                is_p1_winner = (match_data.p1_score >= match_info['game_info'].win_score)
                async_to_sync(self.channel_layer.group_send)(f'tournament-{match_data.tournament.id}', {
                    'type': 'tournament.match.end',
                    'winner_id': match_data.player1.id if is_p1_winner else match_data.player2.id,
                    'round': match_info['game_info'].info['tournament_round']
                })

            start_time = match_data.date_joined if hasattr(match_data, 'date_joined') else None
            duration = None
            if start_time:
                duration = timezone.now() - start_time
            
            # Create match statistics
            MatchStats.objects.create(
                pong_match=match_data,
                p1_paddle_bounces=getattr(game_info, 'paddle_bounces', [0, 0])[0],
                p2_paddle_bounces=getattr(game_info, 'paddle_bounces', [0, 0])[1],
                p1_points_lost_by_wall_hit=getattr(game_info, 'wall_hits', [0, 0])[0],
                p2_points_lost_by_wall_hit=getattr(game_info, 'wall_hits', [0, 0])[1],
                p1_points_lost_by_wrong_color=getattr(game_info, 'wrong_color_hits', [0, 0])[0],
                p2_points_lost_by_wrong_color=getattr(game_info, 'wrong_color_hits', [0, 0])[1],
                p1_color_switches=getattr(game_info, 'color_switches', [0, 0])[0],
                p2_color_switches=getattr(game_info, 'color_switches', [0, 0])[1],
                match_duration=duration
            )

        except Exception as e:
            print('Exception while trying to set match data: ' + str(e))

        print(f'server: game with id {match_id} ended!')

    def disconnect_consumers_from_game(self, match_id):
        match_info = self.get_game(match_id)
        if match_info == None:
            return

        if match_info['p1_consumer'] != None:
            async_to_sync(match_info['p1_consumer'].close)()

        if match_info['p2_consumer'] != None:
            async_to_sync(match_info['p2_consumer'].close)()

    # deletes the game data from the array
    def delete_game(self, match_id):
        try:
            with self.matches_lock:
                self.matches.pop(match_id)

        except Exception:
            print(f'server: game with id {match_id} does not exist')
            return

    def update_player_consumer(self, match_id, player_num, consumer):
        match_info = self.get_game(match_id)
        if match_info == None:
            return

        if player_num == 1:
            try:
                if match_info['p1_consumer'] != None:
                    match_info['p1_consumer'].player_num = 0
                    async_to_sync(match_info['p1_consumer'].close)()

            except Exception:
                pass

            match_info['p1_consumer'] = consumer

        elif player_num == 2:
            try:
                if match_info['p2_consumer'] != None:
                    match_info['p2_consumer'].player_num = 0
                    async_to_sync(match_info['p2_consumer'].close)()

            except Exception:
                pass

            match_info['p2_consumer'] = consumer

        else:
            return

        if match_info['p1_consumer'] == None or (match_info['local'] == False and match_info['p2_consumer'] == None):
            return

        if match_info['thread'].is_alive():
            match_info['paused'] = False
            return

        # NOTE: idk if update_player_consumer should be initializing the game, but eh
        self.start_game(match_id)

    def remove_player_consumer(self, match_id, player_num):
        match_info = self.get_game(match_id)
        if match_info == None:
            return

        if player_num == 1:
            match_info['p1_consumer'] = None

        elif player_num == 2:
            match_info['p2_consumer'] = None

        else:
            return

        # Wait 5 seconds before closing the server
        match_info['paused'] = True

    def update_player_input(self, match_id, player_num, input_type, value):
        print('updating player input')
        match_info = self.get_game(match_id)
        if match_info == None:
            return

        game_info = match_info['game_info']
        player_input = game_info.player_inputs[player_num - 1]
        player_input.set_input(input_type, value)

    def main_loop(self, match_id):
        accumulator_ms = 0
        pause_ms = 0
        last_time_ms = time_ns() / 1000000
        match_info = self.get_game(match_id)
        if match_info == None:
            print(f'thread: FATAL ERROR; game with id {match_id} does not exist')
            return

        while match_info['game_info'].ended == False:
            current_time_ms = time_ns() / 1000000
            delta_time = current_time_ms - last_time_ms
            last_time_ms = current_time_ms

            if match_info['paused']:
                accumulator_ms = 0
                pause_ms += delta_time
                if pause_ms >= 5000:
                    match_info['game_info'].ended = True

            else:
                accumulator_ms += delta_time
                pause_ms = 0

            # run game logic
            msg = None
            while accumulator_ms >= GameLogic.ms_per_frame:
                msg = match_info['game_info'].tick(GameLogic.sec_per_frame)
                accumulator_ms -= GameLogic.ms_per_frame

            # send message to clients :]
            if msg != None:
                try:
                    if match_info['p1_consumer'] != None:
                        async_to_sync(match_info['p1_consumer'].send_json)(msg)
                    if match_info['p2_consumer'] != None:
                        async_to_sync(match_info['p2_consumer'].send_json)(msg)

                except:
                    print('unable to send message to socket, pausing')
                    match_info['paused'] = True

            # NOTE: we don't need a precise sleep function because the accumulator already accounts for sleep inaccuracy :>
            sleep(GameLogic.sec_per_frame)

        self.close_game(match_id)

server_manager = ServerManager()
