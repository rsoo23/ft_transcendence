from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchStatsViewSet, PvpTallyView, UserTotalTallyView

router = DefaultRouter()
router.register(r'match-stats', MatchStatsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('pvp_tally/<int:user1_id>/<int:user2_id>/', PvpTallyView.as_view(), name='pvp-tally'),
    path('user_total_tally/<int:user_id>/', UserTotalTallyView.as_view(), name='user-total-tally'),
]
