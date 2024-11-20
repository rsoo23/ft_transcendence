from django.urls import path
from . import views

urlpatterns = [
	path('create-match/', views.create_match, name='create_match'),
	path('ping_match/<int:match_id>/', views.ping_match, name='ping_match'),
	path('get_match_state/<int:match_id>/', views.get_match_state, name='get_match_state'),
	path('set_player_input/<int:match_id>/', views.set_player_input, name='set_player_input'),
	path('join_match/<int:match_id>/', views.join_match, name='join_match'),
	path('leave_match/<int:match_id>/', views.leave_match, name='leave_match'),
]
