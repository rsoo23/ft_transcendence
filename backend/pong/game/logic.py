from .data import Vector2, PlayerInput, ObjectState
from .paddle import Paddle
from .ball import Ball
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

    def __init__(self):
        self.ended = False
        self.player_inputs = [PlayerInput(), PlayerInput()]
        self.game_size = Vector2(400, 240)
        self.score = [0, 0]
        self.win_score = 5
        self.objects = [
            Paddle(25, 0, 1), # left paddle
            Paddle(self.game_size.x - Paddle.size.x - 25, 0, 2), # right paddle
            Ball(self.game_size.x / 2, self.game_size.y / 2, math.cos(math.radians(45)), math.sin(math.radians(45)), 200),
            PongScore(self.game_size.x / 2 - 40, 60, 0),
            PongScore(self.game_size.x / 2 + 40, 60, 1),
        ]

    # returns an array of objects for the client to render
    def tick(self, dt):
        states = []
        objlist = self.objects.copy() # this is done to prevent processing new objects created in the same tick
        for obj in objlist:
            obj_state = obj.tick(self, dt)
            if obj_state != None:
                states.append(ObjectStateSerializer(obj_state).data)

        return states
