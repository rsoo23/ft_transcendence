from django.urls import path
from . import views

urlpatterns = [
    path('create_token/', views.create_token, name='create_token'),
    path('verify_token/', views.verify_token, name='verify_token'),
    path('create_email_token/', views.create_email_token, name='create_email_token')
]