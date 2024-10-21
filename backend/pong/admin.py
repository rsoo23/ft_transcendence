from django.contrib import admin

from .models import PongMatch

@admin.register(PongMatch)
class PongMatchAdmin(admin.ModelAdmin):
    list_display = ["id", "player1_uuid", "player2_uuid", "p1_score", "p2_score"]
