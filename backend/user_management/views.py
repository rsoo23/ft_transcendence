from django.contrib.auth.forms import UserCreationForm, PasswordResetForm, AuthenticationForm
from django.contrib.auth import authenticate, login, get_user_model, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
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

from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

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
        return CustomUser.objects.exclude(id=current_user.id)

    # gets the current user's info
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def current_user(self, request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            # Set the JWT in a HttpOnly cookie
            response.set_cookie(
                key='access_token', 
                value=response.data['access'], 
                httponly=True, 
                secure=False,  # Set True for HTTPS, False for HTTP development
                samesite='Lax'
            )
            # Optionally add the refresh token in another cookie
            response.set_cookie(
                key='refresh_token', 
                value=response.data['refresh'], 
                httponly=True, 
                secure=False,
                samesite='Lax'
            )
            # Remove token from response body
            response.data.pop('access')
            response.data.pop('refresh')
        return response

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
            with transaction.atomic():
                user = form.save()
                FriendList.objects.create(current_user=user)
                login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def forgot_password_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = PasswordResetForm(data)
        if form.is_valid():
            form.save(
                request=request,
                use_https=request.is_secure(), 
                from_email=settings.DEFAULT_FROM_EMAIL,
                email_template_name='registration/password_reset_email.html'
            )
            return JsonResponse({"success": True})
        return JsonResponse({"success": False, "error": "Invalid email"}, status=400)
    return JsonResponse({"success": False, "error": "Invalid method"}, status=405)

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
def update_password(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		old_password = data.get('old_password')
		new_password = data.get('new_password')
		email = data.get('email')

		try:
			user = User.objects.get(email=email)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User does not exist'}, status=400)

		# Django's built-in check_password function
        # old_password is the password entered by the user
        # user.password is the hashed password stored in the database
		if check_password(old_password, user.password):
			# Django's built-in validate_password function
			try:
				validate_password(new_password, user=user) #user=user to check if password is similar user attributes like username and email
			except ValidationError as e:
				return JsonResponse({'error': list(e.messages)}, status=400)
			user.set_password(new_password)
			user.save()
			return JsonResponse({'message': 'Password updated successfully'})
		else:
			return JsonResponse({'error': 'Incorrect old password'}, status=400)

	else:
		return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
# @permission_classes([AllowAny])
def upload_avatar_image(request):
    print(request.data)
    username = request.data.get('username')
    user = get_object_or_404(CustomUser, username='username')

    serializer = UserAvatarImageSerializer(user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({ "message": "Image uploaded successfully"}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
