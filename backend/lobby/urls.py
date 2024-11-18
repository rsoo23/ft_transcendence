from django.urls import path
from . import views

urlpatterns = [
	path('create_lobby/', views.create_lobby, name='create_lobby'),
	path('create_tournament_lobby/', views.create_tournament_lobby, name='create_tournament_lobby'),
	path('get_lobby/<int:lobby_id>/', views.get_lobby, name='get_lobby'),
]
