from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
# By inheriting from AbstractUser, our Custom User model gets all the fields and methods of the default User model
class CustomUser(AbstractUser):
	two_factor_enabled = models.BooleanField(default=False)
	two_factor_email = models.CharField(null=True, default="", max_length=30, blank=True)
	# pass # Not adding new fields
