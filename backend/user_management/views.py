from django.contrib.auth.forms import UserCreationForm, PasswordResetForm, AuthenticationForm
from django.contrib.auth import authenticate, login, get_user_model, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.conf import settings
from django.contrib.auth import get_user_model
from .forms import CustomUserCreationForm
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            errors = {}
            if not User.objects.filter(username=username).exists():
                errors['username'] = ['User does not exist: please sign up']
            else:
                errors['password'] = ['Incorrect password']
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = CustomUserCreationForm(data)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def forgot_password_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = PasswordResetForm(data)
        if form.is_valid():
            form.save(
                request=request,
                use_https=request.is_secure(), 
                from_email=settings.DEFAULT_FROM_EMAIL,
                email_template_name='registration/password_reset_email.html'
            )
            return JsonResponse({"success": True})
        return JsonResponse({"success": False, "error": "Invalid email"}, status=400)
    return JsonResponse({"success": False, "error": "Invalid method"}, status=405)

@csrf_exempt
def update_username(request):
	# print("Request received~~~~~~~~~~~~", flush=True)
    try:
        data = json.loads(request.body)
        new_username = data.get('new_username')
        
        if not new_username:
            return JsonResponse({'status': 'error', 'message': 'New username is required'}, status=400)
        
        if User.objects.filter(username=new_username).exclude(pk=request.user.pk).exists():
            return JsonResponse({'status': 'error', 'message': 'Username already exists'}, status=400)
        
        request.user.username = new_username
        request.user.save()
        return JsonResponse({'status': 'success', 'message': 'Username updated successfully'})
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

@csrf_exempt
def logout_view(request):
	if request.method == 'POST':
		logout(request)
	# Django's built-in logout function - removes authenticated user from session, flushes session data, deletes session cookie
		return JsonResponse({'success': True})
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

# def hello_world(request):
#     return JsonResponse({'message': 'Hello, world!'})

@csrf_exempt
def update_password(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		old_password = data.get('old_password')
		new_password = data.get('new_password')
		email = data.get('email')

		try:
			user = User.objects.get(email=email)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User does not exist'}, status=400)

		# Django's built-in check_password function
        # old_password is the password entered by the user
        # user.password is the hashed password stored in the database
		if check_password(old_password, user.password):
			# Django's built-in validate_password function
			try:
				validate_password(new_password, user=user) #user=user to check if password is similar user attributes like username and email
			except ValidationError as e:
				return JsonResponse({'error': list(e.messages)}, status=400)
			user.set_password(new_password)
			user.save()
			return JsonResponse({'message': 'Password updated successfully'})
		else:
			return JsonResponse({'error': 'Incorrect old password'}, status=400)

		# print(user)
		# print(user.password)
		# return JsonResponse({'old_password is ': old_password, 'new_password is ': new_password, 'email is ': email})
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def update_email(request):
    try:
        data = json.loads(request.body)
        new_email = data.get('new_email')

        if not new_email:
            return JsonResponse({'status': 'error', 'message': 'Email cannot be empty'}, status=400)

        try:
            user = request.user  # Assuming the user is authenticated - todo
            if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                return JsonResponse({'status': 'error', 'message': 'Email already in use'}, status=400)

            request.user.email = new_email
            request.user.save()
            return JsonResponse({'status': 'success', 'message': 'Email updated successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

