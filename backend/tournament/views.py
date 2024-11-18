from django.shortcuts import render
from django.core.cache import cache
from .models import TournamentModel
import json
import math
import random

# creates a tournament entry and creates the first bracket for the tournament
def create_tournament(lobby_id, host, users):
    tournament = TournamentModel.objects.create(host=host)

    # for debugging usage:
    # user_amt = 18
    # users = [x for x in range(1, user_amt + 1)]
    user_amt = len(users)
    pairs = user_amt - 1
    random.shuffle(users)

    # generate pairs
    max_pairs = 1
    pairs_list = []
    rounds_list = []
    for i in range(pairs):
        pairs_list.append({
            'player1': None,
            'player2': None,
            'round': len(rounds_list) + 1,
            'next_round_pair': (2 + len(pairs_list)) // 2,
            'next_pair_slot': 1 + (len(pairs_list) % 2),
            'winner': None,
        })
        if len(pairs_list) < max_pairs or i + 1 >= pairs:
            continue

        rounds_list.append(pairs_list)
        pairs_list = []
        max_pairs *= 2

    if len(pairs_list) > 0:
        rounds_list.append(pairs_list)

    # flip the rounds order, as it's backwards
    rounds_list.reverse()

    # used to check if the pair's slot is linked by the previous round's pair
    is_linked = lambda i, pair, slot: (
        len(
            [x for x in rounds_list[i - 1] if x['next_round_pair'] == pair and x['next_pair_slot'] == slot]
        ) > 0
    )

    # put the players into the pairs, starting from left to right
    for i in range(len(rounds_list)):
        pairs_list = rounds_list[i]
        for pair_num in range(len(pairs_list)):
            pair = pairs_list[pair_num]
            if i == 0:
                pair['player1'] = users.pop()
                pair['player2'] = users.pop()

            else:
                pair['player1'] = users.pop() if not is_linked(i, pair_num + 1, 1) else None
                pair['player2'] = users.pop() if not is_linked(i, pair_num + 1, 2) else None

        if len(users) <= 0:
            break

    tournament_info = {
        'lobby_id': lobby_id,
        'pairs': pairs,
        'rounds': len(rounds_list),
        'list': rounds_list,
    }
    set_tournament_cache(tournament.id, f'tournament-info-{tournament.id}', json.dumps(tournament_info))
    return tournament

# because there are too many to track
def set_tournament_cache(id, key, value):
    keys_cache = cache.get(f'tournament-keys-{id}')
    if keys_cache == None:
        keys = {key}

    else:
        keys = set(json.loads(keys_cache))
        keys.add(key)

    cache.set(f'tournament-keys-{id}', json.dumps(list(keys)))
    cache.set(key, value)

def clear_tournament_cache(id):
    keys_cache = cache.get(f'tournament-keys-{id}')
    if keys_cache == None:
        return

    keys = set(json.loads(keys_cache))
    for key in keys:
        print(f'removing {key} from redis')
        cache.delete(key)

    cache.delete(f'tournament-keys-{id}')
