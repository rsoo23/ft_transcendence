from .data import Vector2, ObjectState
from .paddle import Paddle
import copy
import math
import random

class Ball():
    size = Vector2(7, 7)
    sqrt_of_two = 2 ** (1 / 2)
    colors = ['#08B393', '#CF2350', '#E37144', '#2A86BB', '#F6B20D', '#8E92B9']

    def __init__(self, x, y, vx, vy, speed):
        self.pos = Vector2(x, y)
        self.vector = Vector2(vx, vy)
        self.speed = speed
        self.color_idx = random.randint(0, 5)

    # basically checks if the path of the ball intersects with a paddle
    def check_paddle_collision(self, prev_pos, paddle):
        left = (self.vector.x < 0)
        up = (self.vector.y > 0)
        prev_x0 = prev_pos.x
        prev_x1 = prev_pos.x + Ball.size.x
        prev_y0 = prev_pos.y
        prev_y1 = prev_pos.y + Ball.size.y
        new_x0 = self.pos.x
        new_x1 = self.pos.x + Ball.size.x
        new_y0 = self.pos.y
        new_y1 = self.pos.y + Ball.size.y
        paddle_x0 = paddle.pos.x
        paddle_x1 = paddle.pos.x + Paddle.size.x
        paddle_y0 = paddle.pos.y
        paddle_y1 = paddle.pos.y + Paddle.size.y

        return (
            (
                (left and prev_x1 > paddle_x0 and new_x0 < paddle_x1)
                or (not left and prev_x0 < paddle_x1 and new_x1 > paddle_x0)
            )
            and (
                (up and prev_y1 > paddle_y0 and new_y0 < paddle_y1)
                or (not up and prev_y0 < paddle_y1 and new_y1 > paddle_y0)
            )
        )

    def tick(self, game_info, dt):
        calc_travel_dist = lambda vector, speed, scale: Vector2(
            scale.x * speed * dt * vector.x,
            scale.y * speed * dt * vector.y
        )

        get_remaining_dist_scale = lambda dist, prev_pos, new_pos: Vector2(
            0 if dist.x == 0 else (dist.x - (new_pos.x - prev_pos.x)) / dist.x,
            0 if dist.y == 0 else (dist.y - (new_pos.y - prev_pos.y)) / dist.y
        )

        states = ObjectState('ball')
        states.append(self.pos, 0.0)

        stop_on_next_loop = False
        to_travel = calc_travel_dist(self.vector, self.speed, Vector2(1, 1))
        while (to_travel.x != 0 or to_travel.y != 0) and not stop_on_next_loop:
            prev_pos = copy.copy(self.pos)
            self.pos.x += to_travel.x
            self.pos.y += to_travel.y

            # bouncing logic starts here
            bounced = False

            # check for paddle bounces
            for paddle in [x for x in game_info.objects if isinstance(x, Paddle)]:
                if not self.check_paddle_collision(prev_pos, paddle):
                    continue

                # check if the color of paddle matches the ball's color
                if self.color_idx != paddle.color_idx:
                    if paddle.player_num == 1:
                        game_info.score[1] += 1
                        # self.pos.x = 0
                    else:
                        game_info.score[0] += 1
                        # self.pos.x = game_info.game_size.x - Ball.size.x

                if game_info.score[0] >= game_info.win_score or game_info.score[1] >= game_info.win_score:
                    game_info.ended = True

                if self.vector.x < 0:
                    self.pos.x = paddle.pos.x + Paddle.size.x

                else:
                    self.pos.x = paddle.pos.x - Ball.size.x

                self.pos.y -= to_travel.y * get_remaining_dist_scale(to_travel, prev_pos, self.pos).x

                # next bounce angle
                ball_rel_pos = self.pos.y + (Ball.size.y / 2) - paddle.pos.y
                new_angle = -60 + max(min(120 * (ball_rel_pos / Paddle.size.y), 120), 0)

                # no shooting in a straight line
                min_angle = 10
                new_angle = max(new_angle, min_angle) if new_angle >= 0 else min(new_angle, -min_angle)

                # set to random color
                self.color_idx = random.randint(0, 5)

                if self.vector.x > 0:
                    new_angle = 180 - new_angle

                new_rads = math.radians(new_angle)
                self.vector.x = math.cos(new_rads)
                self.vector.y = math.sin(new_rads)
                bounced = True

            # check for vertical walls, if hit, score a point for one side
            if self.pos.x + Ball.size.x >= game_info.game_size.x or self.pos.x < 0:
                if self.vector.x < 0:
                    game_info.score[1] += 1
                    self.pos.x = 0

                else:
                    game_info.score[0] += 1
                    self.pos.x = game_info.game_size.x - Ball.size.x

                self.pos.y -= to_travel.y * get_remaining_dist_scale(to_travel, prev_pos, self.pos).x
                if game_info.score[0] >= game_info.win_score or game_info.score[1] >= game_info.win_score:
                    game_info.ended = True

                else:
                    game_info.objects.append(BallTimer())

                game_info.objects.remove(self)
                stop_on_next_loop = True
                bounced = True

            # check for horizontal walls
            if self.pos.y + Ball.size.y >= game_info.game_size.y or self.pos.y < 0:
                self.pos.y = min(max(self.pos.y, 0), game_info.game_size.y - Ball.size.y)
                self.pos.x -= to_travel.x * get_remaining_dist_scale(to_travel, prev_pos, self.pos).y
                self.vector.y *= -1
                bounced = True

            if not bounced:
                break

            dist_scale = get_remaining_dist_scale(to_travel, prev_pos, self.pos)
            # we use pythagoras theorem here to combine the x and y dist_scale together (which results in a magnitude)
            # if you're confused as to why, just think of dist_scale as a vector with a max value of 1 (for both x and y)
            dist_magnitude = ((1 - dist_scale.x) ** 2 + (1 - dist_scale.y) ** 2) ** (1 / 2)
            alpha = abs(dist_magnitude / Ball.sqrt_of_two) 

            states.append(self.pos, alpha)
            to_travel = calc_travel_dist(self.vector, self.speed, dist_scale)

        states.append(self.pos, 1.0, {'color': Ball.colors[self.color_idx]})
        return states

# respawns the ball after 5 seconds
class BallTimer():
    def __init__(self):
        self.time_elapsed = 0

    def tick(self, game_info, dt):
        self.time_elapsed += dt
        if self.time_elapsed < 2.5:
            return None

        # TODO: randomize angle
        new_ball = Ball(game_info.game_size.x / 2, game_info.game_size.y / 2, math.cos(math.radians(45)), math.sin(math.radians(45)), 200)
        new_ball.color_idx = random.randint(0, 5)
        game_info.objects.append(new_ball)
        game_info.objects.remove(self)
        return None
