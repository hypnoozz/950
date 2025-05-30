from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from gym_api.users.serializers import UserSerializer
from .permissions import IsAdmin
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class RegisterView(APIView):
    """
    User registration view
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            # Log the incoming request data
            logger.info(f"Registration attempt with data: {request.data}")
            
            # Create a copy of the data to modify
            data = request.data.copy()
            
            # Set default role if not provided
            if 'role' not in data:
                data['role'] = 'user'
            
            # Validate the data
            serializer = UserSerializer(data=data)
            if not serializer.is_valid():
                logger.error(f"Registration validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Create the user
            user = serializer.save()
            
            # Create JWT tokens
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"User registered successfully: {user.username}")
            
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return Response({
                'error': 'Registration failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    """
    User login view
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({'error': 'Please provide username and password'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response({'error': 'Invalid username or password', 'detail': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Serialize user information
        serializer = UserSerializer(user)
        
        return Response({
            'user': serializer.data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class LogoutView(APIView):
    """
    User logout view
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminUserCreateView(APIView):
    """
    Admin user creation view
    """
    permission_classes = [IsAdmin]
    
    def post(self, request):
        # Get data from request
        data = request.data.copy()
        
        # Ensure password exists
        if 'password' not in data:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Validate data using serializer
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            # Save user and set password
            user = serializer.save()
            
            # Set role (if provided)
            if 'role' in data:
                user.role = data['role']
            else:
                user.role = 'member'  # Default role
                
            user.save()
            
            # Return created user data (without password)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserUpdateView(APIView):
    """
    Admin user update view
    """
    permission_classes = [IsAdmin]
    
    def put(self, request, user_id):
        try:
            # Get user
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
            
        # Get data from request
        data = request.data.copy()
        
        # Update data using serializer
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            # If new password provided, update password
            if 'password' in data and data['password']:
                user.set_password(data['password'])
                
            # Save updates
            serializer.save()
            
            # If role provided, update role
            if 'role' in data:
                user.role = data['role']
                user.save()
                
            return Response(UserSerializer(user).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 