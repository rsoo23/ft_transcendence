import jwt
from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from main.settings import JWT_SECRET_KEY
from django.contrib.auth import get_user_model

@csrf_exempt
def create_token(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        encoded_jwt = jwt.encode({'username': username, 'password': password}, JWT_SECRET_KEY, algorithm= 'HS256')
        if encoded_jwt is None:
            return JsonResponse({'error': 'Token creation fail'}, status=405)
        
        response = HttpResponse('Sending back ID_Token cookie')
        response.set_cookie('ID_Token', encoded_jwt, httponly = 'True', max_age=120)
        return response
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def verify_token(request) :
    if request.method == 'GET':
        if 'ID_Token' in request.COOKIES :
            token = request.COOKIES['ID_Token']
        else :
            return JsonResponse({'success' : False, 'Error': 'ID_Token Not Found'}, status=401)
        
        if token == "":
            return JsonResponse({'success' : False, 'Error' : 'Invalid token value'}, status=401)
        decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms="HS256")
        User = get_user_model()
        if User.objects.filter(username=decoded_jwt['username']).exists():
            return JsonResponse({'success' : True, 'Status' : 'Token Bearer is Valid'})
        else :
            return JsonResponse({'success' : False, 'Status' : 'Token bearer not found'}, status=401)

    return JsonResponse({'Error': 'Invalid request method'}, status=405)