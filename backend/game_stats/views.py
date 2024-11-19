from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import MatchStats
from .serializers import MatchStatsSerializer
from rest_framework.response import Response
from .serializers import UserStatsSerializer

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

class PvpTallyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user1_id, user2_id):
        user1_wins = MatchStats.objects.filter(winner_id=user1_id, loser_id=user2_id).count()
        user1_losses = MatchStats.objects.filter(winner_id=user2_id, loser_id=user1_id).count()

        data = {
            'wins': user1_wins,
            'losses': user1_losses
        }
        serializer = UserStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

class UserTotalTallyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user_wins = MatchStats.objects.filter(winner_id=user_id).count()
        user_losses = MatchStats.objects.filter(loser_id=user_id).count()

        data = {
            'wins': user_wins,
            'losses': user_losses
        }
        serializer = UserStatsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
