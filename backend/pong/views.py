import json
from threading import Thread
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
from .models import PongMatch
from .server import server_manager
import asyncio

# this is used to prevent a task getting deleted mid-execution
background_tasks = set()

# delete the match after 30 seconds if it hasn't actually started
async def try_clean_match(match_id):
    await asyncio.sleep(30)
    if match_id not in server_manager.matches:
        return

    # just check the thread to see if the game is running
    match_info = server_manager.matches[match_id]
    if match_info['thread'].is_alive():
        return

    try:
        match_db_info = [x async for x in PongMatch.objects.filter(id=match_id)][0]
        await match_db_info.adelete()

    except Exception:
        pass

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, server_manager.close_game, match_id)
    print(f'pong: Match with id {match_id} was deleted due to inactivity.')

@csrf_exempt
async def create_match(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            user1 = data['player1_uuid']
            user2 = data['player2_uuid']
            match = await sync_to_async(PongMatch.objects.create)(player1_uuid=user1, player2_uuid=user2)
            server_manager.try_create_game(match.id, f'pongmatch-{match.id}')
            task = asyncio.create_task(try_clean_match(match.id))
            background_tasks.add(task)
            task.add_done_callback(background_tasks.discard)
            return JsonResponse({
                'success': True,
                'match_id': match.id
            })

        except Exception as error:
            return JsonResponse({'success': False, 'Error': str(error)}, status=401)

    return JsonResponse({
        'error': 'Invalid request method',
    })
