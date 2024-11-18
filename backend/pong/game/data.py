from threading import Lock
import copy

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
    def append(self, pos, alpha, info={}):
        self.states.append({
            'pos': copy.copy(pos),
            'alpha': alpha,
            'info': info,
        })

class PlayerInput():
    def __init__(self):
        # data race in my code? it's more likely than you think
        self.input_lock = Lock()
        self.inputs = {
            'up': False,
            'down': False,
            'left': False,
            'right': False,
            'activate_powerup': False,
        }

    def set_input(self, input_type, value):
        with self.input_lock:
            if input_type in self.inputs and isinstance(value, type(self.inputs[input_type])):
                self.inputs[input_type] = value
                return

        print(f'PlayerInput: unknown input {input_type} and value {value}')

    def get_input(self, input_type):
        with self.input_lock:
            return self.inputs[input_type]
