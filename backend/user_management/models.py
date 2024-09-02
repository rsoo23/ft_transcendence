from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager

class CustomUser(AbstractUser):
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_email = models.CharField(null=True, default="", max_length=30, blank=True)
