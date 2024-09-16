from django.urls import path
from . import views

urlpatterns = [
    path('enable_2FA/', views.enable_2FA, name='enable_2FA'),
    path('verify_2FA/', views.verify_2FA, name='verify_2FA'),
]