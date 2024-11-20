from django.urls import path
from . import views

urlpatterns = [
    path('create_email_token/', views.create_email_token, name='create_email_token')
]
