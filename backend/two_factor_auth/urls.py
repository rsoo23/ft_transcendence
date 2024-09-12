from django.urls import path
from . import views

urlpatterns = [
    path('email_2FA_send_code/', views.email_2FA_send_code, name='email_2FA_send_code'),
]