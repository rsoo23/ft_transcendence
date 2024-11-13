from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MatchStats
from .serializers import MatchStatsSerializer

class MatchStatsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing match statistics.
    """
    queryset = MatchStats.objects.all()
    serializer_class = MatchStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optionally restricts the returned match stats,
        by filtering against query parameters in the URL.
        """
        queryset = MatchStats.objects.all()
        
        # Filter by match ID if provided
        match_id = self.request.query_params.get('match_id', None)
        if match_id is not None:
            queryset = queryset.filter(pong_match_id=match_id)
            
        # Filter by player ID if provided
        player_id = self.request.query_params.get('player_id', None)
        if player_id is not None:
            queryset = queryset.filter(
                pong_match__player1_id=player_id
            ) | queryset.filter(
                pong_match__player2_id=player_id
            )
            
        return queryset