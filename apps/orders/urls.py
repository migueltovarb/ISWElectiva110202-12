from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrderListView, 
    OrderDetailView, 
    OrderCreateView,
    OrderStatusView
)
from .cart_views import (
    CartView,
    AddToCartView,
    CartItemView
)
from .admin_views import OrderAdminViewSet

# Configurar router para viewsets
router = DefaultRouter()
router.register(r'admin', OrderAdminViewSet, basename='admin-orders')

urlpatterns = [
    # Rutas de pedidos para clientes
    path('', OrderListView.as_view(), name='order-list'),
    path('create/', OrderCreateView.as_view(), name='order-create'),
    path('<str:order_code>/', OrderDetailView.as_view(), name='order-detail'),
    path('<str:order_code>/status/', OrderStatusView.as_view(), name='order-status'),
    
    # Rutas de carrito
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='cart-add'),
    path('cart/items/<int:item_id>/', CartItemView.as_view(), name='cart-item'),
    
    # Rutas de administración
    path('', include(router.urls)),
]