from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Endpoint para registro de usuarios.
    
    Permite a los usuarios registrarse en la plataforma. Solo requiere:
    * email (correo electrónico único)
    * password (contraseña)
    * password2 (confirmación de contraseña)
    * name (nombre del usuario)
    
    Opcionalmente:
    * phone (teléfono de contacto)
    * address (dirección de entrega)
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data,
            "message": "Usuario creado exitosamente",
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint para inicio de sesión.
    
    Permite a los usuarios iniciar sesión y obtener un token JWT.
    Requiere:
    * email
    * password
    
    Devuelve:
    * tokens de acceso y refresh
    * información básica del usuario
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint para ver y actualizar perfil de usuario.
    
    Permite a los usuarios autenticados obtener y actualizar su información de perfil.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminLoginView(TokenObtainPairView):
    """
    Endpoint para inicio de sesión de administradores.
    
    Similar al inicio de sesión normal, pero verifica que el usuario sea administrador.
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_200_OK:
            # Verificar si el usuario es administrador
            email = request.data.get('email')
            user = User.objects.get(email=email)
            
            if user.role != 'admin':
                return Response(
                    {"detail": "Este usuario no tiene permisos de administrador."},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return response