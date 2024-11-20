import jwt
import json

from main.settings import JWT_SECRET_KEY

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

from django.http import JsonResponse

@csrf_exempt
def create_email_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        encoded_jwt = jwt.encode({'email': email}, JWT_SECRET_KEY, algorithm= 'HS256')
        if encoded_jwt is None:
            return JsonResponse({'error': 'Token creation fail'}, status=405)
        
        response = JsonResponse({'success': True, 'message': 'Sending back Email_Token cookie'})
        response.set_cookie('Email_Token', encoded_jwt, httponly = 'True', max_age=120)
        return response

    return JsonResponse({'error': 'Invalid request method'}, status=405)
