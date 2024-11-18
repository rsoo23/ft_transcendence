from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import LobbyModel
from .serializers import LobbyModelSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_lobby(request):
    try:
        user = request.user
        lobby = LobbyModel.objects.create(host_id=user.id, max_users=2)
        return JsonResponse({
            'success': True,
            'lobby_id': lobby.id,
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'reason': f'Exception while trying to create lobby: {e}: {str(e)}',
        })

@api_view(['POST'])
@parser_classes([JSONParser])
@permission_classes([IsAuthenticated])
def create_tournament_lobby(request):
    try:
        user = request.user
        lobby = LobbyModel.objects.create(
            host_id=user.id,
            max_users=request.data['max_users'],
            is_tournament=True
        )
        return JsonResponse({
            'success': True,
            'lobby_id': lobby.id,
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'reason': f'Exception while trying to create lobby: {e}: {str(e)}',
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_lobby(request, lobby_id):
    lobby = LobbyModel.objects.get(id=lobby_id)
    serializer = LobbyModelSerializer(lobby)
    return Response(serializer.data)
