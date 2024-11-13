from django.contrib import admin
from .models import MatchStats

@admin.register(MatchStats)
class MatchStatsAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'pong_match',
        'p1_paddle_bounces',
        'p2_paddle_bounces',
        'match_duration',
        'created_at'
    )
    list_filter = ('created_at',)
    search_fields = ('pong_match__id',)