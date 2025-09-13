from unittest.mock import patch

from django.urls import reverse
from django.test import override_settings
from django.contrib.auth import get_user_model

from rest_framework.test import APITestCase, APIClient
from rest_framework import status


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AccountsMinimalTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.password = 'StrongPass123!'
        self.user = User.objects.create_user(
            email='user@example.com',
            password=self.password,
            first_name='Test',
            last_name='User',
        )

    def auth(self):
        self.client.force_authenticate(self.user)

    def test_get_csrf_cookie(self):
        url = reverse('csrf')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_delete_profile_requires_auth(self):
        url = reverse('delete-profile')
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_name_wrong_password_returns_400(self):
        self.auth()
        url = reverse('update-name')
        resp = self.client.patch(url, {
            'first_name': 'New',
            'current_password': 'wrong'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_name_success(self):
        self.auth()
        url = reverse('update-name')
        resp = self.client.patch(url, {
            'first_name': 'New',
            'last_name': 'Name',
            'current_password': self.password
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_update_email_missing_fields_returns_400(self):
        self.auth()
        url = reverse('change-email')
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_email_wrong_password_returns_400(self):
        self.auth()
        url = reverse('change-email')
        resp = self.client.post(url, {
            'new_email': 'new@example.com',
            'current_password': 'wrong'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('accounts.views.send_mail')
    def test_update_email_sends_verification(self, mock_send_mail):
        self.auth()
        url = reverse('change-email')
        resp = self.client.post(url, {
            'new_email': 'new@example.com',
            'current_password': self.password
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        mock_send_mail.assert_called()

    def test_verify_email_invalid_link_returns_400(self):
        url = reverse('verify-email', kwargs={'uidb64': 'invalid', 'token': 'bad'})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('accounts.views.send_mail')
    def test_verify_email_happy_path(self, _):
        # Prepare: request change to set session['new_email'] and generate token
        self.auth()
        change_url = reverse('change-email')
        self.client.post(change_url, {
            'new_email': 'new@example.com',
            'current_password': self.password
        }, format='json')

        # Build valid verification URL
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        uidb64 = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        verify_url = reverse('verify-email', kwargs={'uidb64': uidb64, 'token': token})

        # Important: keep session by using same client
        resp = self.client.get(verify_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Email updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'new@example.com')

    @patch('accounts.views.send_mail')
    def test_contact_requires_auth_and_sends_mail(self, mock_send_mail):
        # unauth -> 401
        url = reverse('contact')
        resp_unauth = self.client.post(url, {'message': 'Hi'})
        self.assertEqual(resp_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # auth -> 200 and send_mail called
        self.auth()
        resp_auth = self.client.post(url, {'message': 'Hi'})
        self.assertEqual(resp_auth.status_code, status.HTTP_200_OK)
        mock_send_mail.assert_called()

    def test_delete_profile_deletes_user(self):
        self.auth()
        url = reverse('delete-profile')
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        from accounts.models import UserAccount
        self.assertFalse(UserAccount.objects.filter(pk=self.user.pk).exists())


class DjoserAuthTests(APITestCase):
    """Test Djoser authentication endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        User = get_user_model()
        self.password = 'StrongPass123!'
        self.user = User.objects.create_user(
            email='user@example.com',
            password=self.password,
            first_name='Test',
            last_name='User',
        )

    def test_user_registration(self):
        """Test user registration via Djoser."""
        url = "/api/auth/users/"  # djoser user registration
        data = {
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            're_password': 'NewPass123!',
            'first_name': 'New',
            'last_name': 'User',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify user was created
        User = get_user_model()
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_user_registration_password_mismatch(self):
        """Test registration fails with mismatched passwords."""
        url = "/api/auth/users/"
        data = {
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            're_password': 'DifferentPass123!',
            'first_name': 'New',
            'last_name': 'User',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test user login via Djoser JWT."""
        url = reverse('jwt-create')  # djoser JWT token creation
        data = {
            'email': self.user.email,
            'password': self.password,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        url = reverse('jwt-create')
        data = {
            'email': self.user.email,
            'password': 'wrongpassword',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test JWT token refresh."""
        # First get tokens
        login_url = reverse('jwt-create')
        login_data = {
            'email': self.user.email,
            'password': self.password,
        }
        login_response = self.client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        
        # Refresh token
        refresh_url = reverse('jwt-refresh')
        refresh_data = {'refresh': refresh_token}
        response = self.client.post(refresh_url, refresh_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_protected_endpoint_with_token(self):
        """Test accessing protected endpoint with valid JWT token."""
        # Get token
        login_url = reverse('jwt-create')
        login_data = {
            'email': self.user.email,
            'password': self.password,
        }
        login_response = self.client.post(login_url, login_data, format='json')
        access_token = login_response.data['access']
        
        # Use token to access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        url = reverse('delete-profile')
        response = self.client.delete(url)
        # Should not get 401 (unauthorized)
        self.assertNotEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without token returns 401."""
        url = reverse('delete-profile')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
