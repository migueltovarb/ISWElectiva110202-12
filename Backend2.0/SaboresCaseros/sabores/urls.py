# sabores/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegistroView, UserProfileView, 
    PlatilloViewSet, CategoriaViewSet, 
    PedidoViewSet, UserViewSet,
    MetodoPagoViewSet, TicketSoporteViewSet, ResenaViewSet,
    VerificarPreguntaSeguridadView, RecuperarPasswordView
    )

router = DefaultRouter()
router.register(r'usuarios', UserViewSet, basename='usuarios')
router.register(r'platillos', PlatilloViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'pedidos', PedidoViewSet, basename='pedidos')
router.register(r'metodos-pago', MetodoPagoViewSet, basename='metodos-pago')
router.register(r'tickets', TicketSoporteViewSet, basename='tickets')
router.register(r'resenas', ResenaViewSet, basename='resenas')

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', RegistroView.as_view(), name='registro'),
    path('user/me/', UserProfileView.as_view(), name='user_profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verificar-pregunta/', VerificarPreguntaSeguridadView.as_view()),
    path('recuperar-password/', RecuperarPasswordView.as_view()),
]