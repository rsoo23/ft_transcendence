import json
import jwt
import secrets
import string

from main.settings import JWT_SECRET_KEY

from django.contrib.auth import authenticate, login, get_user_model, logout
from django.views.decorators.csrf import csrf_exempt
from user_management.emails import send_email

from django.http import JsonResponse
from .forms import CustomUserCreationForm
from django.contrib.auth.forms import SetPasswordForm
from two_factor_auth.views import generate_otp, verify_otp
from django.core.cache import cache


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

@csrf_exempt
def email_exist(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        email = data.get('email')
        if get_user_model().objects.filter(email=email).exists():
            return JsonResponse({'success' : True, 'Status' : 'User with email: ' + email + 'is found'}, status=200)
        else :
            return JsonResponse({'success' : False, 'Status' : 'NO user with email: {' + email + '} is found'},status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def verify_change_password_code(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        code = data.get('code')
        if 'Email_Token' in request.COOKIES :
            decoded_token = jwt.decode(request.COOKIES['Email_Token'], JWT_SECRET_KEY, algorithms="HS256")
        else :
            return JsonResponse({'success' : False, 'Error': 'Email_Token Not Found'}, status=401)
        email = decoded_token['email']
        User = get_user_model().objects.get(email=email)
        if cache.get(User.base32_secret):
            otp = cache.get(User.base32_secret)
        else:
            return JsonResponse({'success' : False, 'Status' : f'Forgot password Code Timeout'}, status=401)
        if verify_otp(otp, code):
            return JsonResponse({'success' : True, 'Status' : 'Forgot password Code Verified'}, status=200)
        else:
            return JsonResponse({'success' : False, 'Status' : f'Forgot password code is Wrong'},status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def send_otp_forgot_password(request):
    if request.method == 'POST':
        if 'Email_Token' in request.COOKIES :
            decoded_token = jwt.decode(request.COOKIES['Email_Token'], JWT_SECRET_KEY, algorithms="HS256")
        else :
            return JsonResponse({'success' : False, 'Error': 'Email_Token Not Found'}, status=401)
        email = decoded_token['email']
        User = get_user_model().objects.get(email=email)
        alphabet = string.ascii_letters + string.digits
        if not User.base32_secret:
            secret = ''.join(secrets.choice(alphabet) for i in range(8))
            User.base32_secret = secret
            User.save()
        otp = generate_otp()
        cache.set(User.base32_secret, otp, timeout=30)
        send_email(email, otp)
        return JsonResponse({'success' : True, 'Status' : 'Change password Token sent to :' + email})
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def change_password_view(request):
    if request.method == 'POST':
        if 'Email_Token' in request.COOKIES :
            decoded_token = jwt.decode(request.COOKIES['Email_Token'], JWT_SECRET_KEY, algorithms="HS256")
        else :
            return JsonResponse({'success' : False, 'Error': 'Email_Token Not Found'}, status=401)
        email = decoded_token['email']
        user = get_user_model().objects.get(email=email)
        data = json.loads(request.body)
        form = SetPasswordForm(data=data, user=user)
        if form.is_valid():
            form.save()
            response = JsonResponse({'success': True, 'message': 'Password Changed !'})
            response.delete_cookie('Email_Token')
            return response
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

