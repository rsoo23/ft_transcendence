from django.db import models
from user_management.models import CustomUser
from pong.models import PongMatch

class TournamentModel(models.Model):
    host = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='host')
    closed = models.BooleanField(default=False)
