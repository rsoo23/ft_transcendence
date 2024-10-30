from .data import Vector2, ObjectState

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
