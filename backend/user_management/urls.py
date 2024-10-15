from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
	path('update-username/', views.update_username, name='update_username'),
	path('forgot_password/', views.forgot_password_view, name='forgot_password'),
	path('update_username/', views.update_username, name='update_username'),
	path('logout/', views.logout_view, name='logout'),
 	path('email_exist/', views.email_exist, name='email_exist'),
  	path('verify_change_password_code/', views.verify_change_password_code, name='verify_change_password_code'),
  	path('send_otp_forgot_password/', views.send_otp_forgot_password, name='send_otp_forgot_password'),
    path('change_password/', views.change_password_view, name='change_password')
]
