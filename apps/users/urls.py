from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    UserProfileView,
    AdminLoginView
)

urlpatterns = [
    # HU001 - Registro de Usuario
    path('register/', RegisterView.as_view(), name='register'),
    
    # HU002 - Iniciar Sesión
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # HU016 - Iniciar Sesión como Administrador
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    
    # Perfil de usuario
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]