from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ("two_factor_enabled", "two_factor_email")

class CustomUserChangeForm(UserChangeForm):

    class Meta(UserChangeForm.Meta):
        model = CustomUser
        fields = ("two_factor_enabled", "two_factor_email")
        
#class CustomUserCreationForm(UserCreationForm):
#	class Meta(UserCreationForm.Meta):
#		fields = UserCreationForm.Meta.fields + ('email',)