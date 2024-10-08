from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from threading import Lock
import logging

class Vector2():
    def __init__(self, x=0, y=0):
        self.x = x
        self.y = y

class ObjectState():
    def __init__(self, name):
        self.name = name
        self.states = []

    # alpha is used for interpolation
    # possible values are 0.0 - 1.0
    def append(self, pos, alpha):
        self.states.append({
            'x': pos.x,
            'y': pos.y,
            'alpha': alpha,
        })

class Paddle():
    size = Vector2(7, 45)

    def __init__(self, x=0, y=0):
        self.pos = Vector2(x, y)

    def tick(self, game_info):
        states = ObjectState()
        states.append(self.pos, 0.0)

        # TODO: get player input somehow

        states.append(self.pos, 1.0)
        return states

class Ball():
    size = Vector2(7, 7)

    def __init__(self, x=0, y=0):
        self.pos = Vector2(x, y)

    def tick(self, game_info):
        states = ObjectState()
        states.append(self.pos, 0.0)

        # TODO: get player input somehow

        states.append(self.pos, 1.0)
        return states

class PlayerInput():
    def __init__(self):
        # data race in my code? it's more likely than you think
        self.input_lock = Lock()
        self.inputs = {}

    def set_input(self, type, value):
        self.input_lock.acquire()
        # TODO: do stuff
        self.input_lock.release()

    def get_input(self, type):
        self.input_lock.acquire()
        # TODO: do stuff
        self.input_lock.release()

class GameLogic():
    sec_per_frame = 1 / 60
    ms_per_frame = sec_per_frame * 1000

    def __init__(self):
        self.started = False
        self.ended = False
        self.player_inputs = [PlayerInput(), PlayerInput()]
        self.game_size = Vector2(400, 240)
        self.objects = [
            Paddle(0, 0), # left paddle
            Paddle(self.game_size.x - Paddle.size.x, 0), # right paddle
        ]
        # async_to_sync(self.channel_layer.group_add)(self.group_host, self.channel_name)
        # logging.basicConfig(level=logging.INFO)
        # logging.info(f'created GameLogic')

    # returns an array of objects for the client to render
    def tick(self):
        return []
