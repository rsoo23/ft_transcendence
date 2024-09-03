from django.urls import path
from . import views

urlpatterns = [
    path('enable_2FA/', views.enable_2FA, name='enable_2FA'),
]