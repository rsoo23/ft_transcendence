from django.http import HttpResponse
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from main.settings import JWT_SECRET_KEY
import jwt

@csrf_exempt
def email_2FA_send_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        return JsonResponse({'success' : True, 'Status' : '2FA Token sent to :' + email})
    return JsonResponse({'error': 'Invalid request method'}, status=405)