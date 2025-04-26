from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Order
from .serializers import (
    OrderSerializer, 
    OrderCreateSerializer,
    OrderStatusSerializer
)


class OrderListView(generics.ListAPIView):
    """
    Endpoint para listar pedidos del usuario.
    
    Si el usuario es administrador o staff, verá todos los pedidos.
    Si es un cliente, solo verá sus propios pedidos.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'staff']:
            return Order.objects.all()
        return Order.objects.filter(user=user)


class OrderDetailView(generics.RetrieveAPIView):
    """
    Endpoint para obtener detalles de un pedido específico.
    
    La búsqueda se realiza por el código del pedido (order_code).
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_code'
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'staff']:
            return Order.objects.all()
        return Order.objects.filter(user=user)


class OrderCreateView(generics.CreateAPIView):
    """
    Endpoint para finalizar/crear un pedido.
    
    Requiere que el usuario esté autenticado.
    El pedido debe incluir ítems, dirección de entrega y método de pago.
    """
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response({
            'order': OrderSerializer(order).data,
            'message': 'Pedido creado exitosamente'
        }, status=status.HTTP_201_CREATED)


class OrderStatusView(generics.RetrieveAPIView):
    """
    Endpoint para consultar el estado de un pedido.
    
    Proporciona información resumida sobre el estado del pedido.
    """
    serializer_class = OrderStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_code'
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'staff']:
            return Order.objects.all()
        return Order.objects.filter(user=user)