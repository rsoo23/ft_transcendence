from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from .views import CustomUserViewSet, CookieTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('token/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
	path('forgot_password/', views.forgot_password_view, name='forgot_password'),
	path('update_username/', views.update_username, name='update_username'),
	path('logout/', views.logout_view, name='logout'),
	path('update-password/', views.update_password, name='update_password'),
    path('upload_avatar_image/', views.upload_avatar_image, name='upload_avatar_image'),
    path('', include(router.urls)),
]
