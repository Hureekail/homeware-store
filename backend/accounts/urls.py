from django.urls import include, path
from .views import csrf_token_view, GetCSRFToken, DeleteProfileView, UpdateNameView, UpdateEmailView, VerifyEmailView, ContactView

urlpatterns = [
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/', include('djoser.social.urls')),
    path('auth/csrf/', GetCSRFToken.as_view(), name='csrf'),
    
    path('accounts/delete-profile/', DeleteProfileView.as_view(), name="delete-profile"),
    path('accounts/update-name/', UpdateNameView.as_view(), name="update-name"),
    path('accounts/change-email/', UpdateEmailView.as_view(), name="change-email"),
    path('accounts/verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name="verify-email"),
    path('accounts/contact/', ContactView.as_view(), name="contact"),
]