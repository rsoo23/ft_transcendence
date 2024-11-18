from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MatchStats
from .serializers import MatchStatsSerializer

class MatchStatsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing match statistics.
    Only shows matches that the user is a player in.
    """
    queryset = MatchStats.objects.all() 
    serializer_class = MatchStatsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter match stats to only show matches that the user is a player in.
        """
        user = self.request.user
        return MatchStats.objects.filter(
            pong_match__player1=user
        ) | MatchStats.objects.filter(
            pong_match__player2=user
        ).order_by('-created_at')  # Most recent matches first