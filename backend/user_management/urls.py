from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
	path('forgot_password/', views.forgot_password_view, name='forgot_password'),
	path('update-username/', views.update_username, name='update_username'),
	path('logout/', views.logout_view, name='logout'),
	path('update-password/', views.update_password, name='update_password'),
    path('upload-avatar-image/', views.upload_avatar_image, name='upload_avatar_image')
]
