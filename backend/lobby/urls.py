from django.urls import path
from . import views

urlpatterns = [
	path('create_lobby/', views.create_lobby, name='create_lobby'),
	path('get_lobbies/', views.get_lobbies, name='get_lobbies'),
]
