from django.contrib import admin

from .models import LobbyModel

@admin.register(LobbyModel)
class LobbyModelAdmin(admin.ModelAdmin):
    list_display = ["id", "host_id", "max_users", "closed"]
