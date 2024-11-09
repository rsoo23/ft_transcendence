from django.contrib import admin

from .models import PongMatch

@admin.register(PongMatch)
class PongMatchAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "local",
        "player1",
        "player2",
        "p1_score",
        "p2_score"
    ]
