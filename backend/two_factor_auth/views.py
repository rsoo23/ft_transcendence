import secrets
import json
import jwt
import random
import string

from main.settings import JWT_SECRET_KEY

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from two_factor_auth.emails import send_email
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.core.cache import cache

@csrf_exempt
def send_otp_2FA(request):
    if request.method == 'POST':
        username = get_token_bearer_name(request.COOKIES)
        User = get_user_model().objects.get(username=username)
        email = User.email
        alphabet = string.ascii_letters + string.digits
        if not User.base32_secret:
            secret = ''.join(secrets.choice(alphabet) for i in range(8))
            User.base32_secret = secret
            User.save()
        otp = generate_otp()
        cache.set(User.base32_secret, otp, timeout=30)
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
        if cache.get(User.base32_secret):
            otp = cache.get(User.base32_secret)
        else:
            return JsonResponse({'success' : False, 'Status' : f'2FA Code Timeout'}, status=401)
        if verify_otp(otp, code):
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

def generate_otp():
    global user_otp

    digits = string.digits
    otp = ''.join(random.choice(digits) for _ in range(6))
    return otp

def verify_otp(otp, code):
    if (otp == code):
        return True
    else:
        return False