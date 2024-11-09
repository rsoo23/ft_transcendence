from django.db import models
from user_management.models import CustomUser

class PongMatch(models.Model):
    aborted = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    local = models.BooleanField(default=False)
    type = models.CharField(max_length=100, default='local_classic')
    p1_score = models.IntegerField(default=0)
    p2_score = models.IntegerField(default=0)
    player1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='player1', null=True)
    player2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='player2', null=True)
