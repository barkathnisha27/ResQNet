from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with role-based access.
    
    Required fields:
    - username: Must be unique and not empty
    - email: Valid email, required
    - password: Will be hashed using create_user()
    - role: Required choice (citizen, ngo, government)
    
    Does NOT return password in response.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Password will be hashed'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'role']
        extra_kwargs = {
            'username': {
                'required': True,
                'help_text': 'Username must be unique'
            },
            'email': {
                'required': True,
                'help_text': 'Valid email is required'
            },
            'role': {
                'required': True,
                'help_text': 'Choose one: citizen, ngo, or government'
            }
        }

    def validate(self, attrs):
        """Validate password match and role selection."""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')

        # Check passwords match
        if password != password_confirm:
            raise serializers.ValidationError({
                'password': 'Passwords do not match.'
            })

        # Validate password strength
        try:
            validate_password(password)
        except serializers.ValidationError as e:
            raise serializers.ValidationError({
                'password': list(e.messages)
            })

        # Validate role selection
        role = attrs.get('role')
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if role not in valid_roles:
            raise serializers.ValidationError({
                'role': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
            })

        # Check for duplicate username
        if User.objects.filter(username=attrs.get('username')).exists():
            raise serializers.ValidationError({
                'username': 'This username is already taken.'
            })

        # Check for duplicate email
        if User.objects.filter(email=attrs.get('email')).exists():
            raise serializers.ValidationError({
                'email': 'This email is already registered.'
            })

        attrs.pop('password_confirm', None)
        return attrs

    def create(self, validated_data):
        """Create user using create_user() to ensure proper password hashing."""
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
                role=validated_data['role']
            )
            return user
        except IntegrityError as e:
            raise serializers.ValidationError({
                'detail': 'Registration failed. Please check your information.'
            })


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extended JWT serializer that includes user role in token claims
    and response data.
    """

    @classmethod
    def get_token(cls, user):
        """Add custom claims to JWT token."""
        token = super().get_token(user)

        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username

        return token

    def validate(self, attrs):
        """
        Validate login credentials and ensure user is active.
        Only registered users can login.
        """
        try:
            data = super().validate(attrs)
        except serializers.ValidationError:
            # Re-raise with clear message
            raise serializers.ValidationError({
                'detail': 'Invalid username or password. Please check your credentials.'
            })

        # Check if user is active
        user = self.user
        if not user.is_active:
            raise serializers.ValidationError({
                'detail': 'This account has been deactivated.'
            })

        # Add user role to response
        data['role'] = user.role
        data['username'] = user.username
        data['user_id'] = user.id

        return data


class UserSerializer(serializers.ModelSerializer):
    """
    General user information serializer.
    Does NOT include password.
    """

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'reliability_score']
        read_only_fields = ['id', 'reliability_score']