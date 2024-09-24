from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from main.settings import JWT_SECRET_KEY
from two_factor_auth.emails import send_email
import pyotp
from django.contrib.auth import get_user_model
import jwt

@csrf_exempt
def send_otp_2FA(request):
    if request.method == 'POST':
        username = get_token_bearer_name(request.COOKIES)
        User = get_user_model().objects.get(username=username)
        email = User.email
        if not User.base32_secret:
            secret = pyotp.random_base32()
            User.base32_secret = secret
            User.save()
            totp = pyotp.TOTP(secret)
            otp = totp.now()
        else:
            totp = pyotp.TOTP(User.base32_secret)
            otp = totp.now()
        send_email(email, otp)
        return JsonResponse({'success' : True, 'Status' : '2FA Token sent to :' + email})
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def verify_2FA(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code')
        username = get_token_bearer_name(request.COOKIES)
        User = get_user_model().objects.get(username=username)
        totp = pyotp.TOTP(User.base32_secret)
        if totp.verify(code):
            User.two_factor_enabled = True
            User.save()
            return JsonResponse({'success' : True, 'Status' : '2FA Code Verified'}, status=200)
        else:
            return JsonResponse({'success' : False, 'Status' : f'2FA Code is Wrong'},status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_token_bearer_name(cookie):
    if 'ID_Token' in cookie :
        token = cookie['ID_Token']
    decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms="HS256")
    return(decoded_jwt['username'])

@csrf_exempt
def status_2FA(request):
    if request.method == 'GET':
        username = get_token_bearer_name(request.COOKIES)
        User = get_user_model().objects.get(username=username)
        if User.two_factor_enabled :
            return JsonResponse({'success' : True, 'Status' : '2FA enabled'}, status=200)
        else :
            return JsonResponse({'success' : False, 'Status' : '2FA not enabled'},status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
