from django.urls import path
from . import views

urlpatterns = [
    path('send_otp_2FA/', views.send_otp_2FA, name='send_otp_2FA'),
    path('verify_2FA/', views.verify_2FA, name='verify_2FA'),
    path('status_2FA/', views.status_2FA, name='status_2FA'),
]