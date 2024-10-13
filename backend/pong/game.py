from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from threading import Lock
from .serializers import ObjectStateSerializer
import copy
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
            'pos': copy.copy(pos),
            'alpha': alpha,
        })

class Paddle():
    size = Vector2(7, 45)
    speed = 250

    def __init__(self, x, y, player_num):
        self.pos = Vector2(x, y)
        self.player_num = player_num

    def tick(self, game_info, dt):
        states = ObjectState('paddle')
        states.append(self.pos, 0.0)

        player_input = game_info.player_inputs[self.player_num - 1]
        if player_input.get_input('up'):
            self.pos.y -= Paddle.speed * dt

        if player_input.get_input('down'):
            self.pos.y += Paddle.speed * dt

        # clamp pos
        self.pos.y = min(max(self.pos.y, 0), game_info.game_size.y - Paddle.size.y)

        states.append(self.pos, 1.0)
        return states

class Ball():
    size = Vector2(7, 7)

    def __init__(self, x, y):
        self.pos = Vector2(x, y)

    def tick(self, game_info, dt):
        states = ObjectState('ball')
        states.append(self.pos, 0.0)

        # TODO: get player input somehow

        states.append(self.pos, 1.0)
        return states

class PlayerInput():
    def __init__(self):
        # data race in my code? it's more likely than you think
        self.input_lock = Lock()
        self.inputs = {
            'up': False,
            'down': False,
        }

    def set_input(self, input_type, value):
        self.input_lock.acquire()
        if input_type in self.inputs and isinstance(value, type(self.inputs[input_type])):
            self.inputs[input_type] = value

        else:
            print(f'unknown input {input_type} and value {value}')

        self.input_lock.release()

    def get_input(self, input_type):
        self.input_lock.acquire()
        value = self.inputs[input_type]
        self.input_lock.release()

        return value

class GameLogic():
    sec_per_frame = 1 / 60
    ms_per_frame = sec_per_frame * 1000

    def __init__(self):
        self.started = False
        self.ended = False
        self.player_inputs = [PlayerInput(), PlayerInput()]
        self.game_size = Vector2(400, 240)
        self.objects = [
            Paddle(0, 0, 1), # left paddle
            Paddle(self.game_size.x - Paddle.size.x, 0, 2), # right paddle
        ]
        # async_to_sync(self.channel_layer.group_add)(self.group_host, self.channel_name)
        # logging.basicConfig(level=logging.INFO)
        # logging.info(f'created GameLogic')

    # returns an array of objects for the client to render
    def tick(self, dt):
        states = []
        for obj in self.objects:
            obj_state = obj.tick(self, dt)
            if obj_state != None:
                states.append(ObjectStateSerializer(obj_state).data)

        return states
