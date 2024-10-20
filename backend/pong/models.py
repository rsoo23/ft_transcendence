from django.db import models

class PongMatch(models.Model):
    aborted = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    player1_uuid = models.BigIntegerField()
    player2_uuid = models.BigIntegerField()
