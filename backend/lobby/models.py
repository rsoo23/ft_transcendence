from django.db import models

class LobbyModel(models.Model):
    host_id = models.BigIntegerField()
    max_users = models.BigIntegerField()
    closed = models.BooleanField(default=False)
