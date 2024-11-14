from .data import Vector2, ObjectState
import math

class Powerup():
    activator_player_num = 0
    powerup_duration = 0

class PowerupsManager():
    powerups = ['jumbled_colors']
    active_powerups = []

    def __init__(self):
        pass

    def tick(self, game_info, dt):
        pass
        # player_input = game_info.player_inputs[self.player_num - 1]

        # states = ObjectState('powerups_manager')
        # states.append(self.pos, 0.0)
        #
        # states.append(self.pos, 1.0, {'active_powerup': self.active_powerups})
        # return states

    def activate_powerup(self, game_info):
        pass
        # if game_info.powerup_charge[0] < 3:
        #     pass
        # if player_input.get_input('up'):
        #     self.pos.y -= Paddle.speed * dt
        #
        # if player_input.get_input('down'):
        #     self.pos.y += Paddle.speed * dt


