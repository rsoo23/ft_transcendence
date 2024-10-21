from .data import Vector2, PlayerInput
from .paddle import Paddle
from .ball import Ball
from pong.serializers import ObjectStateSerializer
import math

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
            Ball(self.game_size.x / 2, self.game_size.y / 2, 1, math.sin(math.radians(45)), 200),
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
