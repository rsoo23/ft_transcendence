import json, os, jwt, secrets, string

from main.settings import JWT_SECRET_KEY

from user_management.emails import send_email

from django.contrib.auth.forms import SetPasswordForm
from two_factor_auth.views import generate_otp, verify_otp
from django.core.cache import cache

from django.contrib.auth.forms import UserCreationForm, PasswordResetForm, AuthenticationForm
from django.contrib.auth import authenticate, login, get_user_model, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, get_user_model
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth import get_user_model
from .forms import CustomUserCreationForm
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from .serializers import UserAvatarImageSerializer
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from django.db import transaction
from .models import CustomUser
from friends_system.models import FriendList

from .serializers import CustomUserSerializer

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.staticfiles import finders
# CustomUserViewSet:
# list()        for listing all users (GET /users/)
# retrieve()    for getting a single user (GET /users/<id>/)
# create()      for adding a new user (POST /users/)
# update()      partial_update() for updating users (PUT/PATCH /users/<id>/)
# destroy()     for deleting a user (DELETE /users/<id>/)

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    # gets all users info excluding the current user
    def get_queryset(self):
        current_user = self.request.user
        return CustomUser.objects.exclude(id=current_user.id).exclude(is_staff=True)

    def retrieve(self, request, pk=None):
        user = CustomUser.objects.get(id=pk)
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    # gets the current user's info
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def current_user(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

def move_token_to_cookie(response):
    # Set the JWT in a HttpOnly cookie
    response.set_cookie(
        key='refresh_token',
        value=response.data['refresh'],
        httponly=True,
        secure=False,
        samesite='Lax'
    )

    # Remove token from response body
    response.data.pop('refresh')

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            move_token_to_cookie(response)

        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            request.data['refresh'] = request.COOKIES.get('refresh_token')

        except Exception:
            pass

        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            move_token_to_cookie(response)

        return response

class HeaderTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        try:
            request.data['token'] = request.headers.get('Authorization').replace('Bearer ', '')

        except Exception:
            pass

        return super().post(request, *args, **kwargs)

User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)

        errors = {}
        if user is not None:
            if user.is_staff:
                errors['username'] = ['Admin cannot login']
                return JsonResponse({'success': False, 'errors': errors})
            login(request, user)
            return JsonResponse({
                'success': True,
                'two_factor_enabled': user.two_factor_enabled
            })
        else:
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
            with transaction.atomic():
                user = form.save()
                FriendList.objects.create(current_user=user)
                login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        # Django's built-in logout function - removes authenticated user from session, flushes session data, deletes session cookie
        logout(request)
        response = JsonResponse({'success': True})
        response.set_cookie(
            key='refresh_token',
            value='',
            httponly=True,
            secure=False,  # Set True for HTTPS, False for HTTP development
            samesite='Lax'
        )
        return response
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

@csrf_exempt
def update_password(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		new_password = data.get('new_password')
		user = request.user

		if check_password(new_password, user.password):
			return JsonResponse({'status': 'error', 'message': 'New password cannot be the same as the old password'}, status=400)

		try:
			validate_password(new_password, user=user)
		except ValidationError as e:
			return JsonResponse({'status': 'error', 'message': list(e.messages)}, status=400)

		user.set_password(new_password)
		user.save()
		return JsonResponse({'status': 'success', 'message': 'Password updated successfully'})
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def update_email(request):
    try:
        data = json.loads(request.body)
        new_email = data.get('new_email')

        if not new_email:
            return JsonResponse({'status': 'error', 'message': 'Email cannot be empty'}, status=400)

        try:
            user = request.user  # Assuming the user is authenticated - todo
            if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                return JsonResponse({'status': 'error', 'message': 'Email already in use'}, status=400)

            request.user.email = new_email
            request.user.save()
            return JsonResponse({'status': 'success', 'message': 'Email updated successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def upload_avatar_image(request):
    try:
        # Since we're using IsAuthenticated, we can get the user directly
        user = request.user

        if 'avatar_img' not in request.FILES:
            return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserAvatarImageSerializer(user, data={'avatar_img': request.FILES['avatar_img']}, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Image uploaded successfully",
                "avatar_url": request.build_absolute_uri(user.avatar_img.url) if user.avatar_img else None
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_avatar_image(request):
    """
    Returns the user's avatar image if it exists, otherwise returns default avatar
    """
    user_id = request.query_params.get('user_id')

    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return HttpResponse(status=404)
    
    if user.avatar_img and user.avatar_img.name:
        return HttpResponse(user.avatar_img, content_type='image/jpeg')

    # Return default avatar
    default_avatar_path = finders.find('images/kirby.png')
    try:
        with open(default_avatar_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/png')
    except:
        return HttpResponse(status=404)
