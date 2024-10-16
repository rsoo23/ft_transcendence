from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
	path('forgot_password/', views.forgot_password_view, name='forgot_password'),
	path('update_username/', views.update_username, name='update_username'),
	path('logout/', views.logout_view, name='logout'),
	# path('hello/', views.hello_world, name='hello_world'),
	path('update-password/', views.update_password, name='update_password'),
	path('update_email/', views.update_email, name='update_email'),
]
