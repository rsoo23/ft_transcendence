from .data import Vector2, ObjectState
import random

class BigPaddle():
    def __init__(self, powerups_manager):
        self.name = 'big_paddle'
        self.duration = 5
        self.time_elapsed = 0
        self.powerups_manager = powerups_manager

    def tick(self, game_info, dt):
        self.time_elapsed += dt
        if self.time_elapsed < self.duration:
            return None

        self.powerups_manager.active_powerup = ''
        self.powerups_manager.powerup_activated = False
        game_info.objects.remove(self)
        return None

class PowerupsManager():
    def __init__(self, player_num):
        self.activator_player_num = player_num
        self.powerup_functions = [BigPaddle(self)]
        self.active_powerup = ''
        self.powerup_activated = False
        self.pos = Vector2(0, 0)

    def tick(self, game_info, dt):
        player_input = game_info.player_inputs[self.activator_player_num - 1]

        if player_input.get_input('activate_powerup'):
            if game_info.powerup_charge_num[self.activator_player_num - 1] == 3:
                powerup_idx = random.randint(0, len(self.powerup_functions) - 1)

                self.active_powerup = self.powerup_functions[powerup_idx].name

                game_info.objects.append(self.powerup_functions[powerup_idx])

                self.powerup_activated = True

                game_info.powerup_charge_num[self.activator_player_num - 1] = 0

                player_input.set_input('activate_powerup', False)

        states = ObjectState('powerups_manager')
        states.append(self.pos, 0.0)
        states.append(self.pos, 1.0, {
            'activator_player_num': self.activator_player_num,
            'active_powerup': self.active_powerup,
            'powerup_activated': self.powerup_activated
        })
        return states


class JumbledColorsIndicator():
    def __init__(self):
        self.name = 'jumbled_colors_indicators'
        self.duration = 5
        self.time_elapsed = 0

    def tick(self, game_info, dt):
        self.time_elapsed += dt
        if self.time_elapsed < self.duration:
            return None

        game_info.objects.remove(self)
        return None

