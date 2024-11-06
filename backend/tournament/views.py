from django.shortcuts import render
from django.core.cache import cache
from .models import TournamentModel
import json
import math

def create_tournament(lobby_id, host, users):
    tournament = TournamentModel.objects.create(host=host)

    user_amt = len(users)
    pairs = math.ceil(user_amt / 2)
    tmp_pairs = pairs
    brackets = 0
    while tmp_pairs > 0:
        brackets += 1
        tmp_pairs = math.ceil(tmp_pairs / 2)

    tournament_info = {
        'lobby_id': lobby_id,
        'pairs': pairs,
        'brackets': brackets,
    }
    set_tournament_cache(tournament.id, f'tournament-info-{tournament.id}', json.dumps(tournament_info))
    create_bracket(tournament.id, 1, pairs, users)
    return tournament

def create_bracket(id, bracket_num, pairs, users):
    user_i = 0
    pairs_arr = []
    for i in range(pairs):
        user1 = users[user_i]
        user2 = users[user_i + 1] if user_i + 1 < len(users) else None
        pair = (user1, user2)
        pairs_arr.append(pair)
        user_i += 2

    set_tournament_cache(id, f'tournament-{id}-{bracket_num}', json.dumps(pairs_arr))

# because there are too many to track
def set_tournament_cache(id, key, value):
    keys_cache = cache.get(f'tournament-keys-{id}')
    if keys_cache == None:
        keys = {key}

    else:
        keys = set(json.dumps(keys_cache))
        keys.add(key)

    cache.set(f'tournament-keys-{id}', json.dumps(list(keys)))
    cache.set(key, value)

def clear_tournament_cache(id):
    keys_cache = cache.get(f'tournament-keys-{id}')
    if keys_cache == None:
        return

    keys = set(json.dumps(keys_cache))
    for key in keys:
        cache.delete(key)

    cache.delete(f'tournament-keys-{id}')
