from django.db import models
from pong.models import PongMatch

class MatchStats(models.Model):
    pong_match = models.OneToOneField(
        PongMatch,
        on_delete=models.CASCADE,
        related_name='match_stats'
    )
    
    p1_paddle_bounces = models.IntegerField(default=0)
    p2_paddle_bounces = models.IntegerField(default=0)
    
    p1_points_lost_by_wall_hit = models.IntegerField(default=0)
    p2_points_lost_by_wall_hit = models.IntegerField(default=0)

    p1_points_lost_by_wrong_color = models.IntegerField(default=0)
    p2_points_lost_by_wrong_color = models.IntegerField(default=0)

    p1_color_switches = models.IntegerField(default=0)
    p2_color_switches = models.IntegerField(default=0)

    match_duration = models.DurationField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Match Statistics'
        verbose_name_plural = 'Match Statistics'

    def __str__(self):
        return f"Stats for Match {self.pong_match.id}"