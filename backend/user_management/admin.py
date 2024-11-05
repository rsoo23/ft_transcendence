from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = [
        "id",
        "username",
        "email",
        "is_online",
        "two_factor_enabled",
        "avatar_img",
        "password",
        "base32_secret",
    ]

admin.site.register(CustomUser, CustomUserAdmin)
