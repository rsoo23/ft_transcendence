from .data import Vector2, ObjectState
import math

class CountdownTimer():
    time_elapsed = 0
    pos = Vector2(200, 120)

    def __init__(self, duration):
        self.countdown_duration = duration

    def tick(self, game_info, dt):
        self.time_elapsed += dt
        countdown = self.countdown_duration - self.time_elapsed
        if countdown < 0:
            game_info.objects.remove(self)
            return None

        states = ObjectState('countdown_timer')
        states.append(self.pos, 0.0)

        states.append(self.pos, 1.0, {'player_turn': game_info.player_turn, 'time': int(countdown)})

        return states

