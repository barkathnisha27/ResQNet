from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import User


class AuthTests(APITestCase):
    def setUp(self):
        # create data for each role user
        self.citizen_data = {
            'username': 'citizen1',
            'email': 'citizen1@example.com',
            'password': 'StrongPass123!',
            'password_confirm': 'StrongPass123!',
            'role': 'citizen'
        }
        self.ngo_data = {
            'username': 'ngo1',
            'email': 'ngo1@example.com',
            'password': 'NGOPass123!',
            'password_confirm': 'NGOPass123!',
            'role': 'ngo'
        }
        self.gov_data = {
            'username': 'gov1',
            'email': 'gov1@example.com',
            'password': 'GovPass123!',
            'password_confirm': 'GovPass123!',
            'role': 'government'
        }

    def test_register_and_login_citizen(self):
        # register citizen
        response = self.client.post(reverse('register'), self.citizen_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='citizen1').exists())
        self.assertEqual(User.objects.get(username='citizen1').role, 'citizen')

        # login with citizen credentials
        login_resp = self.client.post(reverse('login'), {'username': 'citizen1', 'password': 'StrongPass123!'}, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_resp.data)
        self.assertEqual(login_resp.data['role'], 'citizen')

    def test_register_duplicate_username(self):
        self.client.post(reverse('register'), self.citizen_data, format='json')
        response2 = self.client.post(reverse('register'), self.citizen_data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response2.data)

    def test_login_wrong_password(self):
        self.client.post(reverse('register'), self.citizen_data, format='json')
        resp = self.client.post(reverse('login'), {'username': 'citizen1', 'password': 'WrongPass'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_role_permissions(self):
        # register all roles
        self.client.post(reverse('register'), self.citizen_data, format='json')
        self.client.post(reverse('register'), self.ngo_data, format='json')
        self.client.post(reverse('register'), self.gov_data, format='json')

        # login each user and attempt to create incident (citizen only)
        for creds, can_create in [(
            {'username': 'citizen1', 'password': 'StrongPass123!'}, True),
            ({'username': 'ngo1', 'password': 'NGOPass123!'}, False),
            ({'username': 'gov1', 'password': 'GovPass123!'}, False),
        ]:
            token_resp = self.client.post(reverse('login'), creds, format='json')
            self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
            token = token_resp.data['access']
            self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

            incident_data = {
                'disaster_type': 'flood',
                'severity': 5,
                'people_affected': 100,
                'latitude': 0.0,
                'longitude': 0.0,
                'description': 'Test incident'
            }
            create_resp = self.client.post('/api/incidents/create/', incident_data, format='json')
            if can_create:
                self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
            else:
                self.assertEqual(create_resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_nonexistent_user_login(self):
        resp = self.client.post(reverse('login'), {'username': 'noone', 'password': 'foo'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_user_cannot_login(self):
        user = User.objects.create_user(username='inactive', password='pass123', role='citizen', email='inactive@example.com')
        user.is_active = False
        user.save()
        resp = self.client.post(reverse('login'), {'username': 'inactive', 'password': 'pass123'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
