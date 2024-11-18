from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MatchStatsViewSet

router = DefaultRouter()
router.register(r'match-stats', MatchStatsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
