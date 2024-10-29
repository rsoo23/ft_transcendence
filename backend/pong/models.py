from django.db import models

class PongMatch(models.Model):
    aborted = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    local = models.BooleanField(default=False)
    p1_score = models.IntegerField(default=0)
    p2_score = models.IntegerField(default=0)
    player1_uuid = models.BigIntegerField()
    player2_uuid = models.BigIntegerField()
