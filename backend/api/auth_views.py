from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User

class PasswordResetRequestView(APIView):
    """POST /api/auth/password-reset/ — Request a reset link via email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email kiritilishi shart.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Use the frontend URL for the reset link
            # Default to localhost if FRONTEND_URL is not set
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
            
            subject = "Studex: Parolni qayta tiklash"
            message = (
                f"Assalomu alaykum, {user.full_name or user.username}!\n\n"
                f"Siz Studex platformasidagi parolingizni tiklashni so'radingiz. "
                f"Parolni yangilash uchun quyidagi havolaga o'ting:\n\n"
                f"{reset_url}\n\n"
                f"Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xatga e'tibor bermang.\n\n"
                f"Hurmat bilan,\nStudex jamoasi"
            )
            
            try:
                send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
            except Exception as e:
                # Log the error but don't expose too much to the user
                print(f"Email error: {e}")
                return Response({'detail': 'Email yuborishda xato yuz berdi.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Always return 200 to prevent user enumeration
        return Response({'detail': 'Parolni tiklash havolasi elektron pochtangizga yuborildi (agar u mavjud bo\'lsa).'})

class PasswordResetConfirmView(APIView):
    """POST /api/auth/password-reset-confirm/ — Set a new password using token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        if not all([uidb64, token, new_password]):
            return Response({'detail': 'Barcha ma\'lumotlar kiritilishi shart.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Parol muvaffaqiyatli o\'zgartirildi.'})
        else:
            return Response({'detail': 'Havola noto\'g\'ri yoki muddati o\'tgan.'}, status=status.HTTP_400_BAD_REQUEST)
