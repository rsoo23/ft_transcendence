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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .emails import send_email

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_otp_2FA(request):
    try:
        user = request.user  # DRF's IsAuthenticated decorator provides the user
        email = user.email
        
        # Generate and send OTP
        alphabet = string.ascii_letters + string.digits
        if not user.base32_secret:
            secret = ''.join(secrets.choice(alphabet) for i in range(8))
            user.base32_secret = secret
            user.save()
        
        otp = generate_otp()
        cache.set(user.base32_secret, otp, timeout=30)
        send_email(email, otp)
        
        return Response({
            'success': True, 
            'Status': '2FA Token sent to :' + email
        })
        
    except Exception as e:
        print(f"Error in send_otp_2FA: {str(e)}")
        return Response({
            'error': 'Server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2FA(request):
    try:
        data = request.data
        code = data.get('code')
        user = request.user
        
        if cache.get(user.base32_secret):
            otp = cache.get(user.base32_secret)
        else:
            return Response({
                'success': False, 
                'Status': '2FA Code Timeout'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        if verify_otp(otp, code):
            user.two_factor_enabled = True
            user.save()
            return Response({
                'success': True, 
                'Status': '2FA Code Verified'
            })
        else:
            return Response({
                'success': False, 
                'Status': '2FA Code is Wrong'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def status_2FA(request):
    try:
        user = request.user
        return Response({
            'success': user.two_factor_enabled,
            'Status': '2FA enabled' if user.two_factor_enabled else '2FA not enabled'
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2FA(request):
    try:
        user = request.user
        user.two_factor_enabled = False
        user.save()
        return Response({
            'success': True,
            'Status': '2FA disabled'
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_token_bearer_name(cookie):
    if 'ID_Token' not in cookie:
        raise ValueError("ID_Token not found in cookies")
    
    token = cookie['ID_Token']
    decoded_jwt = jwt.decode(token, JWT_SECRET_KEY, algorithms="HS256")
    return decoded_jwt['username']

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
