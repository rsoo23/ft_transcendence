from rest_framework import serializers
from .models import MatchStats
from pong.models import PongMatch
from user_management.models import CustomUser

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']

class PongMatchSerializer(serializers.ModelSerializer):
    player1 = PlayerSerializer()
    player2 = PlayerSerializer()
    
    class Meta:
        model = PongMatch
        fields = ['id', 'player1', 'player2', 'p1_score', 'p2_score', 'date_joined']

class MatchStatsSerializer(serializers.ModelSerializer):
    pong_match = PongMatchSerializer()
    
    class Meta:
        model = MatchStats
        fields = '__all__'