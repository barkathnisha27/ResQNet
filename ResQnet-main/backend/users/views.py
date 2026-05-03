from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny

from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer
)
from .models import User
from .permissions import IsAnonymous


class RegisterView(generics.CreateAPIView):
    """
    Public endpoint for user registration.
    
    Required fields:
    - username (unique)
    - email (unique)
    - password
    - password_confirm
    - role (citizen, ngo, or government)
    
    Response:
    - User details (NO password returned)
    - Success message
    
    Errors:
    - 400: Validation errors (duplicate username, invalid role, etc.)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Customize response to include success message."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {
                'success': True,
                'message': 'User registered successfully. You can now login.',
                'user': {
                    'id': serializer.data['id'],
                    'username': serializer.data['username'],
                    'email': serializer.data['email'],
                    'role': serializer.data['role']
                }
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(TokenObtainPairView):
    """
    JWT login endpoint (replacing default TokenObtainPairView).
    
    Only registered users can login. Anonymous login is rejected.
    
    Required fields:
    - username
    - password
    
    Response on success:
    - access: JWT access token (valid 60 minutes)
    - refresh: JWT refresh token (valid 24 hours)
    - role: User's role (citizen, ngo, or government)
    - username: Username
    - user_id: User ID
    
    Errors:
    - 401: Invalid credentials or non-existent user
    - 400: Invalid role or inactive user
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Post request to obtain JWT tokens."""
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {
                    'success': False,
                    'detail': str(e.detail[0]) if hasattr(e, 'detail') else str(e)
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            {
                'success': True,
                'message': 'Login successful',
                'access': serializer.validated_data['access'],
                'refresh': serializer.validated_data['refresh'],
                'role': serializer.validated_data['role'],
                'username': serializer.validated_data['username'],
                'user_id': serializer.validated_data['user_id']
            },
            status=status.HTTP_200_OK
        )


class CurrentUserView(generics.RetrieveAPIView):
    """
    Endpoint to get current user information.
    
    Requires authentication.
    Returns:
    - User details (username, email, role, etc.)
    """
    serializer_class = UserSerializer
    permission_classes = []  # Uses default IsAuthenticated

    def get_object(self):
        """Return the current authenticated user."""
        return self.request.user