from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator

def user_avatar_path(instance, filename):
    # Generate path like 'avatar_images/user_<id>/<filename>'
    return f'avatar_images/user_{instance.id}/{filename}'

# Create your models here.
# By inheriting from AbstractUser, our Custom User model gets all the fields and methods of the default User model
class CustomUser(AbstractUser):
	two_factor_enabled = models.BooleanField(default=False)
	two_factor_email = models.CharField(null=True, default="", max_length=30, blank=True)
	email = models.EmailField(unique=True)
	avatar_img = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
        ]
    )
