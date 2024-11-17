from .data import Vector2, ObjectState
import random

class BigPaddle():
    def __init__(self, powerups_manager):
        self.name = 'big_paddle'
        self.duration = 10
        self.time_elapsed = 0
        self.powerups_manager = powerups_manager

    def tick(self, game_info, dt):
        paddle = game_info.get_paddle(self.powerups_manager.activator_player_num)

        self.time_elapsed += dt
        if self.time_elapsed < self.duration:
            paddle.size = Vector2(7, 80)
            return None

        paddle.size = Vector2(7, 45)
        self.powerups_manager.powerup_activated = False
        game_info.objects.remove(self)
        return None

class PowerupsManager():
    def __init__(self, player_num):
        self.activator_player_num = player_num
        self.powerup_types = ['big_paddle']
        self.powerup_activated = False
        self.pos = Vector2(0, 0)

    def select_random_powerup(self, game_info):
        powerup = random.choice(self.powerup_types)

        match powerup:
            case 'big_paddle':
                selected_powerup = BigPaddle(self)

        game_info.objects.append(selected_powerup)

        self.powerup_activated = True

    def tick(self, game_info, dt):
        player_input = game_info.player_inputs[self.activator_player_num - 1]

        if player_input.get_input('activate_powerup'):
            if game_info.powerup_charge_num[self.activator_player_num - 1] == 3:
                self.select_random_powerup(game_info)

                game_info.powerup_charge_num[self.activator_player_num - 1] = 0

                player_input.set_input('activate_powerup', False)

        states = ObjectState('powerups_manager')
        states.append(self.pos, 0.0)
        states.append(self.pos, 1.0, {
            'activator_player_num': self.activator_player_num,
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

