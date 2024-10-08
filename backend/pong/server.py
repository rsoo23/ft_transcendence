from channels.layers import get_channel_layer
from threading import Thread, Lock
from asgiref.sync import async_to_sync
from .game import GameLogic
from time import sleep

class Match():
    def __init__(self, group_match):
        self.game_info = GameLogic()
        self.thread = Thread(target=self.main_loop)
        self.group_match = group_match
        self.p1_consumer = None
        self.p2_consumer = None

    def main_loop(self):
        pass

class ServerManager():
    def __init__(self):
        # supposedly, python's dicts are hashmaps, so this shouldn't be too bad
        self.matches = {}
        self.matches_lock = Lock()
        # not sure if this would be used, but it could be good for automating group messages
        self.channel_layer = get_channel_layer()

    # will do nothing if game already exists
    def try_create_game(self, match_id, group_match):
        if match_id in self.matches:
            print(f'match with id {match_id} already exists!')
            return

        print(f'creating match with id {match_id}')
        self.matches[match_id] = {
            'game_info': GameLogic(),
            'thread': Thread(target=self.main_loop, args=(match_id)),
            'group_match': group_match,
            'p1_consumer': None,
            'p2_consumer': None,
        }

    def start_game(self, match_id):
        self.matches[match_id]['thread'].start()
        pass

    # NOTE: this forcifully ends the game, and the match is considered invalid
    # TODO: add another method that actually fits the note above
    # closes
    async def close_game(self, match_id):
        match_info = self.matches[match_id]
        if match_info['thread'].is_alive():
            match_info['game_info'].ended = True
            match_info['thread'].join()

        if match_info['p1_consumer'] != None:
            match_info['p1_consumer'].close()

        if match_info['p2_consumer'] != None:
            match_info['p2_consumer'].close()

        print('game ended!')
        self.matches_lock.acquire()
        self.matches.pop(match_id)
        self.matches_lock.release()
        pass

    # idk if this is needed yet
    def get_game(self, match_id):
        pass

    def update_player_consumer(self, match_id, player_num, consumer):
        match_info = self.matches[match_id]

        if player_num == 1:
            match_info['p1_consumer'] = consumer

        elif player_num == 2:
            match_info['p2_consumer'] = consumer

        else:
            return

        if match_info['p1_consumer'] == None or match_info['p2_consumer'] == None:
            return

        # NOTE: idk if update_player_consumer should be initializing the game, but eh
        self.start_game(match_id)

    def update_player_input(self, match_id, player_num):
        match_info = self.matches[match_id]
        if player_num == 1:
            pass

        elif player_num == 2:
            pass

    def main_loop(self, match_id):
        i = 0
        match_info = self.matches[match_id]
        while match_info['game_info'].ended == False:
            async_to_sync(match_info['p1_consumer'].send)(text_data='ticked!')
            async_to_sync(match_info['p2_consumer'].send)(text_data='ticked!')
            # async_to_sync(self.channel_layer.group_send)(match_info['group_match'], {'type': 'send.player.update'})
            sleep(GameLogic.sec_per_frame)
            i += 1
            if i == 10000:
                break
