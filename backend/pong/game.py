from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from threading import Lock
from .serializers import ObjectStateSerializer
import copy
import logging
import math

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
    sqrt_of_two = 2 ** (1 / 2)

    def __init__(self, x, y, vx, vy, speed):
        self.pos = Vector2(x, y)
        self.vector = Vector2(vx, vy)
        self.speed = speed

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

                if self.vector.x < 0:
                    self.pos.x = paddle.pos.x + Paddle.size.x

                else:
                    self.pos.x = paddle.pos.x - Ball.size.x

                self.pos.y -= to_travel.y * get_remaining_dist_scale(to_travel, prev_pos, self.pos).x
                self.vector.x *= -1
                bounced = True

            # check for vertical walls, if hit, score a point for one side
            if self.pos.x + Ball.size.x >= game_info.game_size.x or self.pos.x < 0:
                if self.vector.x < 0:
                    game_info.score[0] += 1
                    self.pos.x = 0

                else:
                    game_info.score[1] += 1
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

        states.append(self.pos, 1.0)
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
        new_ball = Ball(game_info.game_size.x / 2, game_info.game_size.y / 2, 1, math.sin(math.radians(45)), 200)
        game_info.objects.append(new_ball)
        game_info.objects.remove(self)
        return None

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
        self.score = [0, 0]
        self.win_score = 5
        self.objects = [
            Paddle(25, 0, 1), # left paddle
            Paddle(self.game_size.x - Paddle.size.x - 25, 0, 2), # right paddle
            Ball(self.game_size.x / 2, self.game_size.y / 2, 1, math.sin(math.radians(45)), 200),
        ]
        # async_to_sync(self.channel_layer.group_add)(self.group_host, self.channel_name)
        # logging.basicConfig(level=logging.INFO)
        # logging.info(f'created GameLogic')

    # returns an array of objects for the client to render
    def tick(self, dt):
        states = []
        objlist = self.objects.copy() # this is done to prevent processing new objects created in the same tick
        for obj in objlist:
            obj_state = obj.tick(self, dt)
            if obj_state != None:
                states.append(ObjectStateSerializer(obj_state).data)

        return states
