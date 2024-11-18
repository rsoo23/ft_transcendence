from .data import Vector2, ObjectState
import random

class Powerup():
    def __init__(self, powerups_manager):
        self.powerups_manager = powerups_manager
        self.duration = 10
        self.time_elapsed = 0
        self.powerup_label_duration = 1 
        self.is_reversed = False

# increases the size of the activator's paddle for 10 seconds
class BigPaddle(Powerup):
    def __init__(self, powerups_manager):
        super().__init__(powerups_manager)
        self.name = 'big_paddle'

    def tick(self, game_info, dt):
        paddle = game_info.get_paddle(self.powerups_manager.activator_player_num)

        self.time_elapsed += dt
        if self.time_elapsed > self.powerup_label_duration:
            self.powerups_manager.activated_powerup = ''

        if self.time_elapsed < self.duration:
            paddle.size = Vector2(7, 80)
            return None

        paddle.size = Vector2(7, 45)
        self.powerups_manager.is_powerup_activated = False
        game_info.objects.remove(self)
        return None

# swap the opponent's paddle up and down directions for 10 seconds
class SwapUpDown(Powerup):
    def __init__(self, powerups_manager):
        super().__init__(powerups_manager)
        self.name = 'swap_up_down'

    def tick(self, game_info, dt):
        paddle = game_info.get_paddle(self.powerups_manager.opponent_player_num)

        self.time_elapsed += dt
        if self.time_elapsed > self.powerup_label_duration:
            self.powerups_manager.activated_powerup = ''

        if self.time_elapsed < self.duration:
            if not self.is_reversed:
                paddle.move_functions.reverse()
                self.is_reversed = True
            return None

        paddle.move_functions.reverse()
        game_info.objects.remove(self)
        return None

# swap the opponent's paddle color shifting directions for 10 seconds
class SwapLeftRight(Powerup):
    def __init__(self, powerups_manager):
        super().__init__(powerups_manager)
        self.name = 'swap_left_right'

    def tick(self, game_info, dt):
        paddle = game_info.get_paddle(self.powerups_manager.opponent_player_num)

        self.time_elapsed += dt
        if self.time_elapsed > self.powerup_label_duration:
            self.powerups_manager.activated_powerup = ''

        if self.time_elapsed < self.duration:
            if not self.is_reversed:
                paddle.color_shift_functions.reverse()
                self.is_reversed = True
            return None

        paddle.color_shift_functions.reverse()
        game_info.objects.remove(self)
        return None

class PowerupsManager():
    def __init__(self, player_num):
        self.activator_player_num = player_num
        self.opponent_player_num = 1 if player_num == 2 else 2
        self.powerup_types = ['big_paddle', 'swap_up_down', 'swap_left_right']
        self.is_powerup_activated = False
        self.pos = Vector2(200, 120)
        self.activated_powerup = ''

    def select_random_powerup(self, game_info):
        self.activated_powerup = random.choice(self.powerup_types)

        match self.activated_powerup:
            case 'big_paddle':
                selected_powerup = BigPaddle(self)
            case 'swap_up_down':
                selected_powerup = SwapUpDown(self)
            case 'swap_left_right':
                selected_powerup = SwapLeftRight(self)

        game_info.objects.append(selected_powerup)

        self.is_powerup_activated = True

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
            'is_powerup_activated': self.is_powerup_activated,
            'activated_powerup': self.activated_powerup
        })
        return states

