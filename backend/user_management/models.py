from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator
import os

def user_avatar_path(instance, filename):
    # Generate path like 'avatar_images/user_<id>/<filename>'
    return f'avatar_images/user_{instance.id}/{filename}'

# Create your models here.
# By inheriting from AbstractUser, our Custom User model gets all the fields and methods of the default User model
# Override the save and delete method in the Custom User model to delete the old avatar 
class CustomUser(AbstractUser):
    two_factor_enabled = models.BooleanField(default=False)
    base32_secret = models.CharField(max_length=32, blank=True, null=True)
    email = models.EmailField(unique=True)
    avatar_img = models.ImageField(
        upload_to=user_avatar_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
        ]
    )
    is_online = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.pk:  # Check if this is an update and not a new instance
            try:
                old_instance = CustomUser.objects.get(pk=self.pk)
                
                # Check if there's an old avatar and a new avatar is being set
                # Only update avatar will go through these code
                if old_instance.avatar_img and hasattr(self.avatar_img, 'file'):
                    try:
                        old_path = old_instance.avatar_img.path
                        print(f"Old avatar path: {old_path}")
                        print(f"New avatar name: {self.avatar_img.name}")
                        
                        # Only delete if the paths are different
                        if old_instance.avatar_img.name != self.avatar_img.name:
                            print(f"Attempting to delete old avatar at: {old_path}")
                            if os.path.exists(old_path):
                                os.remove(old_path)
                                print(f"Successfully deleted old avatar")
                            else:
                                print(f"Old avatar file not found at: {old_path}")
                    except Exception as e:
                        print(f"Error during avatar cleanup: {str(e)}")
                
            except CustomUser.DoesNotExist:
                print("User instance does not exist yet")
            except Exception as e:
                print(f"Unexpected error during save: {str(e)}")
        
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.avatar_img:
            try:
                file_path = self.avatar_img.path
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"Successfully deleted avatar during user deletion")
            except Exception as e:
                print(f"Error deleting avatar during user deletion: {str(e)}")
        super().delete(*args, **kwargs)
