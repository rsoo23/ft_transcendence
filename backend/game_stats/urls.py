from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchStatsViewSet

router = DefaultRouter()
router.register(r'match-stats', MatchStatsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/pvp_tally/<int:user1_id>/<int:user2_id>/', UserVsUserStatsView.as_view(), name='pvp-tally'),
    path('stats/user_total_tally/<int:user_id>/', UserTotalStatsView.as_view(), name='user-total-tally'),
]
