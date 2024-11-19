from .data import Vector2, PlayerInput, ObjectState
from .paddle import Paddle
from .ball import Ball, BallTimer
from .powerups_manager import PowerupsManager
from .countdown_timer import CountdownTimer
from pong.serializers import ObjectStateSerializer
import math

class PongScore():
    def __init__(self, x, y, score_index):
        self.pos = Vector2(x, y)
        self.score_index = score_index

    def tick(self, game_info, dt):
        states = ObjectState('score')
        states.append(self.pos, 0.0, {'score': game_info.score[self.score_index]})
        states.append(self.pos, 1.0, {'score': game_info.score[self.score_index]})
        return states

class GameLogic():
    sec_per_frame = 1 / 60
    ms_per_frame = sec_per_frame * 1000

    def __init__(self, info):
        self.ended = False
        self.info = info
        self.player_inputs = [PlayerInput(), PlayerInput()]
        self.game_size = Vector2(400, 240)
        self.score = [0, 0]
        self.win_score = int(self.info['game_score'])
        self.countdown_duration = 5
        self.player_turn = 1
        self.game_turn = 1
        self.total_paddle_hits = 0
        self.powerup_charge_num = [0, 0]
        self.objects = [
            Paddle(25, 0, 1), # left paddle
            Paddle(self.game_size.x - Paddle.size.x - 25, 0, 2), # right paddle
            BallTimer(),
            PongScore(self.game_size.x / 2 - 40, 60, 0),
            PongScore(self.game_size.x / 2 + 40, 60, 1),
            CountdownTimer(self.countdown_duration),
            PowerupsManager(1),
            PowerupsManager(2)
        ]
        # Add stat tracking
        self.paddle_bounces = [0, 0]  # Tracks hits for each player
        self.wall_hits = [0, 0]       # Tracks wall hits leading to points
        self.wrong_color_hits = [0, 0] # Tracks wrong color hits
        self.color_switches = [0, 0]   # Tracks color switches

    def add_paddle_bounce(self, player_num):
        self.paddle_bounces[player_num - 1] += 1

    def add_wall_hit(self, player_num):
        self.wall_hits[player_num - 1] += 1

    def add_wrong_color_hit(self, player_num):
        self.wrong_color_hits[player_num - 1] += 1

    def add_color_switch(self, player_num):
        self.color_switches[player_num - 1] += 1

    def get_paddle(self, player_num):
        for obj in self.objects:
            if isinstance(obj, Paddle) and obj.player_num == player_num:
                return obj
        return None

    # returns an array of objects for the client to render
    def tick(self, dt):
        states = []
        objlist = self.objects.copy() # this is done to prevent processing new objects created in the same tick
        for obj in objlist:
            obj_state = obj.tick(self, dt)
            if obj_state != None:
                states.append(ObjectStateSerializer(obj_state).data)

        return states
