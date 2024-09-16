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
def enable_2FA(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        username = data.get('username')
        User = get_user_model()
        user = User.objects.get(username=username)
        if not user.base32_secret:
            secret = pyotp.random_base32()
            user.base32_secret = secret
            user.save()
            totp = pyotp.TOTP(secret)
            otp = totp.now()
        else:
            totp = pyotp.TOTP(user.base32_secret)
            otp = totp.now()
        print(otp)
        send_email(email, otp)
        return JsonResponse({'success' : True, 'Status' : '2FA Token sent to :' + email})
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def verify_2FA(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code')
        if 'ID_Token' in request.COOKIES :
            token = request.COOKIES['ID_Token']
        decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms="HS256")
        User = get_user_model().objects.get(username=decoded_jwt['username'])
        totp = pyotp.TOTP(User.base32_secret)
        if totp.verify(code):
            User.two_factor_enabled = True
            User.save()
            return JsonResponse({'success' : True, 'Status' : '2FA Code Verified'}, status=200)
        else:
            return JsonResponse({'success' : False, 'Status' : '2FA Code is Wrong'},status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=405)