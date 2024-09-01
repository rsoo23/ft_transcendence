from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import CustomUser
from django.contrib.auth import get_user_model

class CustomUserCreationForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].label = 'password1'
        self.fields['username'].label = 'username'
        self.fields['email'].label = 'email'
        self.fields['two_factor_enabled'].label = False
        self.fields['two_factor_email'].label = ""
        
    class Meta:
        model = CustomUser
        fields = ("username", "password1", "email", "two_factor_enabled", "two_factor_email")


class CustomUserChangeForm(UserChangeForm):

    class Meta(UserChangeForm.Meta):
        model = CustomUser
        fields = ("two_factor_enabled", "two_factor_email")
        
#class CustomUserCreationForm(UserCreationForm):
#	class Meta(UserCreationForm.Meta):
#		fields = UserCreationForm.Meta.fields + ('email',)