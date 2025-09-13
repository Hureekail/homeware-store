from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .models import UserAccount

from dotenv import load_dotenv
import os
load_dotenv('.env.local')

@api_view(['GET'])
def csrf_token_view(request):

    csrf_token = get_token(request)
    return Response({'csrf_token': csrf_token})

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return JsonResponse({'success': 'CSRF cookie set'})

@method_decorator(ensure_csrf_cookie, name='dispatch')
class DeleteProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        try:
            user = request.user
            user.delete()
            return Response({'message': 'Profile successfully deleted'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UpdateNameView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        try:
            user = request.user
            first_name  = request.data.get('first_name')
            last_name  = request.data.get('last_name')
            current_password = request.data.get('current_password')

            if not authenticate(email=user.email, password=current_password):
                return Response(
                    {'detail': 'Current password is incorrect'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if first_name:
                user.first_name = first_name

            if last_name:
                user.last_name = last_name
            user.save()
            
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

@method_decorator(ensure_csrf_cookie, name='dispatch')
class UpdateEmailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        new_email = request.data.get('new_email')
        current_password = request.data.get('current_password')

        if not new_email or not current_password:
            return Response(
                {'detail': 'Please provide both new email and current password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not authenticate(email=user.email, password=current_password):
            return Response(
                {'detail': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if UserAccount.objects.filter(email=new_email).exists():
            return Response(
                {'detail': 'Email is already taken'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Store new email in session
        request.session['new_email'] = new_email

        verification_url = f"{os.getenv('FRONTEND_DOMAIN')}/verify-email/{uid}/{token}"
        send_mail(
            'Verify your new email address',
            f'Please click the following link to verify your new email address: {verification_url}',
            settings.EMAIL_HOST_USER,
            [new_email],
            fail_silently=False,
        )

        return Response(
            {'detail': 'Verification email has been sent to your new email address'},
            status=status.HTTP_200_OK
        )

@method_decorator(ensure_csrf_cookie, name='dispatch')
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = UserAccount.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserAccount.DoesNotExist):
            return Response(
                {'detail': 'Invalid verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'detail': 'Invalid or expired verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_email = request.session.get('new_email')
        if not new_email:
            return Response(
                {'detail': 'No pending email change found'},
                status=status.HTTP_400_BAD_REQUEST
            )


        user.email = new_email
        user.save()
        

        if 'new_email' in request.session:
            del request.session['new_email']

        return Response(
            {'detail': 'Email successfully updated'},
            status=status.HTTP_200_OK
        )

@method_decorator(ensure_csrf_cookie, name='dispatch')
class ContactView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user = request.user
            message = request.data.get('message')
                
            send_mail(
                f'New Contact Form Submission from {user.get_full_name()}',
                f'''
                Email: {user.email}
                Message: {message}
                ''',
                settings.EMAIL_HOST_USER,
                [settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
            
            return Response({'detail': 'Message sent successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    