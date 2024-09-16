from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
# By inheriting from AbstractUser, our Custom User model gets all the fields and methods of the default User model
class CustomUser(AbstractUser):
	two_factor_enabled = models.BooleanField(default=False)
	base32_secret = models.CharField(max_length=32, blank=True, null=True)
	email = models.EmailField(unique=True)
	# pass # Not adding new fields
 