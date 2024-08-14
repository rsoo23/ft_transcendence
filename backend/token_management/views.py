import jwt
from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from main.settings import JWT_SECRET_KEY

@csrf_exempt
def create_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        encoded_jwt = jwt.encode({"username": username, "password": password}, JWT_SECRET_KEY, algorithm= "HS256")
        if encoded_jwt is not None:
            response = HttpResponse("Set-Cookie")
            response.set_cookie('ID_Token', encoded_jwt, httponly = 'True')
            return response
        else:
            return JsonResponse({'error': 'Token creation fail'}, status=405)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
    
