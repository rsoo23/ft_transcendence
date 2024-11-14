from adrf.decorators import api_view
from rest_framework.decorators import permission_classes, parser_classes
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from asgiref.sync import sync_to_async
from user_management.models import CustomUser
from .models import PongMatch
from tournament.models import TournamentModel
from .server import server_manager
import asyncio

# this is used to prevent a task getting deleted mid-execution
background_tasks = set()

# delete the match after 30 seconds if it hasn't actually started
async def try_clean_match(match_id):
    await asyncio.sleep(30)

    print(f'pong: Attempting to remove match with id {match_id}. (routine cleaning)')
    loop = asyncio.get_running_loop()
    match_info = await loop.run_in_executor(None, server_manager.get_game, match_id)
    if match_info == None:
        return

    # just check the thread to see if the game is running
    if match_info['thread'].is_alive():
        print(f'pong: Match with id {match_id} is still running normally. (routine cleaning)')
        return

    try:
        match_db_info = [x async for x in PongMatch.objects.filter(id=match_id)][0]
        await match_db_info.adelete()

    except Exception:
        pass

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, server_manager.close_game, match_id)
    print(f'pong: Match with id {match_id} was deleted due to inactivity. (routine cleaning)')

async def create_match_and_game(user1, user2, type, tournament_id=-1):
    local = (type == 'local_classic')
    player1 = await CustomUser.objects.aget(id=user1)
    player2 = (await CustomUser.objects.aget(id=user2)) if not local else None
    tournament = await TournamentModel.objects.aget(id=tournament_id) if tournament_id != -1 else None

    match = await sync_to_async(PongMatch.objects.create)(
        player1=player1,
        player2=player2,
        type=type,
        tournament=tournament,
    )
    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, server_manager.try_create_game, match.id, f'pongmatch-{match.id}', local)

    task = asyncio.create_task(try_clean_match(match.id))
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

    return match

@csrf_exempt
@api_view(['POST'])
@parser_classes([JSONParser])
@permission_classes([IsAuthenticated])
async def create_match(request):
    try:
        user1 = request.data['player1_uuid']
        user2 = request.data['player2_uuid']
        match = await create_match_and_game(user1, user2, request.data['type'])
        return JsonResponse({
            'success': True,
            'match_id': match.id
        })

    except Exception as error:
        return JsonResponse({'success': False, 'Error': str(error)}, status=401)
