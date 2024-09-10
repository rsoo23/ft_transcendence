from django.urls import path
from . import views

urlpatterns = [
	path('create-match/', views.create_match, name='create_match'),
]
