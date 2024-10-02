import json
import jwt
import pyotp

from main.settings import JWT_SECRET_KEY

from django.contrib.auth import authenticate, login, get_user_model, logout
from django.views.decorators.csrf import csrf_exempt
from user_management.emails import send_email

from django.http import JsonResponse
from .forms import CustomUserCreationForm
from django.contrib.auth.forms import SetPasswordForm


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
	if request.method == 'POST':
		data = json.loads(request.body)
		old_username = data.get('old_username')
		new_username = data.get('new_username')
		
		try:
			user = User.objects.get(username=old_username)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User does not exist'}, status=400)
		
		if User.objects.filter(username=new_username).exists():
			return JsonResponse({'error': 'Username already exists'}, status=400)
		
		user.username = new_username
		user.save()
		return JsonResponse({'message': 'Username updated successfully'})
	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def logout_view(request):
	if request.method == 'POST':
		logout(request)
	# Django's built-in logout function - removes authenticated user from session, flushes session data, deletes session cookie
		return JsonResponse({'message': 'Logged out successfully'})
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
        totp = pyotp.TOTP(User.base32_secret)
        if totp.verify(code):
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
        if not User.base32_secret:
            secret = pyotp.random_base32()
            User.base32_secret = secret
            User.save()
            totp = pyotp.TOTP(User.base32_secret)
            otp = totp.now()
        else:
            totp = pyotp.TOTP(User.base32_secret) 
            otp = totp.now()
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

