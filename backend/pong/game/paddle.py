from .data import Vector2, ObjectState

class Paddle():
    size = Vector2(7, 45)
    speed = 250
    default_color_order = ['#08B393', '#CF2350', '#E37144', '#2A86BB', '#F6B20D', '#8E92B9']
    current_color_order = default_color_order.copy()

    def __init__(self, x, y, player_num):
        self.pos = Vector2(x, y)
        self.player_num = player_num
        self.color_idx = 0

    def tick(self, game_info, dt):
        states = ObjectState('paddle')
        states.append(self.pos, 0.0)

        player_input = game_info.player_inputs[self.player_num - 1]
        if player_input.get_input('up'):
            self.pos.y -= Paddle.speed * dt

        if player_input.get_input('down'):
            self.pos.y += Paddle.speed * dt

        if player_input.get_input('left'):
            if self.color_idx == 0:
                self.color_idx = 5
            else:
                self.color_idx -= 1

            player_input.set_input('left', False)

        if player_input.get_input('right'):
            if self.color_idx == 5:
                self.color_idx = 0
            else:
                self.color_idx += 1

            player_input.set_input('right', False)

        # clamp pos
        self.pos.y = min(max(self.pos.y, 0), game_info.game_size.y - Paddle.size.y)

        states.append(self.pos, 1.0, {
            'player_num': self.player_num,
            'color': Paddle.current_color_order[self.color_idx],
            'color_idx': self.color_idx,
            'powerup_charge_num': game_info.powerup_charge_num,
            'is_default_color_order': True,
        })
        return states
