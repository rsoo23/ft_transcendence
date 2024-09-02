from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from main.settings import JWT_SECRET_KEY
import jwt

@csrf_exempt
def enable_2FA(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        
        if 'ID_Token' in request.COOKIES :
            token = request.COOKIES['ID_Token']
        else :
            return JsonResponse({'success' : False, 'Error': 'ID_Token Not Found'}, status=401)
        
        if token == "":
            return JsonResponse({'success' : False, 'Error' : 'Invalid token value'}, status=401)
        
        decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms="HS256")
        User = get_user_model()
        user = User.objects.get(username=decoded_jwt['username'])
        user.two_factor_email = email
        user.two_factor_enabled = True
        user.save()
        return JsonResponse({'success' : True, 'Status' : '2FA Enabled'})
    return JsonResponse({'error': 'Invalid request method'}, status=405)