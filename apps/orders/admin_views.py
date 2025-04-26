from rest_framework import generics, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from django.utils import timezone

from .models import Order
from .serializers import OrderSerializer, OrderStatusUpdateSerializer
from apps.menu.permissions import IsAdminOrStaff

class OrderAdminViewSet(viewsets.ModelViewSet):
    """
    Viewset para la gestión completa de pedidos por parte de los administradores.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method']
    search_fields = ['order_code', 'user__name', 'user__email', 'delivery_address']
    ordering_fields = ['created_at', 'updated_at', 'total_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Order.objects.select_related('user').prefetch_related('items__menu_item').all()
        
        # Filtrar por rango de fechas
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                queryset = queryset.filter(created_at__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(
                    hour=23, minute=59, second=59, tzinfo=timezone.utc
                )
                queryset = queryset.filter(created_at__lte=end_date)
            except ValueError:
                pass
                
        # Filtrar por hoy
        today = self.request.query_params.get('today')
        if today and today.lower() == 'true':
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            queryset = queryset.filter(created_at__gte=today_start)
            
        return queryset
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Endpoint para actualizar el estado de un pedido.
        """
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            status_value = serializer.validated_data.get('status')
            if status_value:
                order.status = status_value
            
            payment_status = serializer.validated_data.get('payment_status')
            if payment_status:
                order.payment_status = payment_status
                
            estimated_time = serializer.validated_data.get('estimated_delivery_time')
            if estimated_time:
                order.estimated_delivery_time = estimated_time
                
            order.save()
            return Response(OrderSerializer(order).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Endpoint para obtener estadísticas para el dashboard de administración.
        """
        # Estadísticas de hoy
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Total de pedidos de hoy
        today_orders = Order.objects.filter(created_at__gte=today_start)
        today_count = today_orders.count()
        
        # Ingresos de hoy
        today_revenue = sum(order.total_amount for order in today_orders)
        
        # Pedidos pendientes
        pending_orders = Order.objects.filter(
            status__in=['pendiente', 'confirmado', 'en_preparacion', 'en_camino']
        ).count()
        
        # Pedidos por estado
        status_counts = {}
        for status_choice, label in Order.STATUS_CHOICES:
            status_counts[status_choice] = Order.objects.filter(status=status_choice).count()
        
        # Pedidos de los últimos 7 días
        last_week_start = timezone.now() - timedelta(days=7)
        daily_orders = []
        for i in range(7):
            day = last_week_start + timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            day_count = Order.objects.filter(created_at__gte=day_start, created_at__lte=day_end).count()
            daily_orders.append({
                'date': day.strftime('%Y-%m-%d'),
                'count': day_count
            })
        
        return Response({
            'today_orders': today_count,
            'today_revenue': float(today_revenue),
            'pending_orders': pending_orders,
            'status_counts': status_counts,
            'daily_orders': daily_orders
        })