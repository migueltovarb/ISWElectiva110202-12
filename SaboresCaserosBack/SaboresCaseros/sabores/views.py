# sabores/views.py
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model
from .models import (
    Usuario, Categoria, Platillo, Pedido, DetallePedido,
    MetodoPago, TicketSoporte, MensajeSoporte, Resena
)
from .serializers import (
    UsuarioSerializer, CategoriaSerializer, PlatilloSerializer,
    PedidoSerializer, DetallePedidoSerializer,
    MetodoPagoSerializer, TicketSoporteSerializer,
    MensajeSoporteSerializer, ResenaSerializer
)
from rest_framework.decorators import action
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta

User = get_user_model()

class RegistroView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            # Quitar confirmPassword si existe
            data = request.data.copy()
            if 'confirmPassword' in data:
                data.pop('confirmPassword')
                
            serializer = UsuarioSerializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request):
        print("GET /user/me/ - Usuario:", request.user.username)  # Debug
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        print("PATCH /user/me/ - Usuario:", request.user.username)  # Debug
        print("Datos recibidos:", request.data)  # Debug
        print("Archivos recibidos:", request.FILES)  # Debug para ver archivos
        
        # Debug adicional para ver los campos específicamente
        for key, value in request.data.items():
            print(f"Campo: {key}, Valor: {value}, Tipo: {type(value)}")
        
        serializer = UsuarioSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            print("Perfil actualizado exitosamente")  # Debug
            print("Datos guardados:", serializer.data)  # Debug para ver qué se guardó
            return Response(serializer.data)
        print("Errores de validación:", serializer.errors)  # Debug
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlatilloViewSet(viewsets.ModelViewSet):
    queryset = Platillo.objects.filter(disponible=True)
    serializer_class = PlatilloSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        categoria = self.request.query_params.get('categoria', None)
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        return queryset

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.AllowAny]
    

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Pedido.objects.all().order_by('-fecha_pedido')
        return Pedido.objects.filter(cliente=self.request.user).order_by('-fecha_pedido')
    
    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas del dashboard"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        # Filtrar por fechas si se proporcionan
        queryset = self.get_queryset()
        if fecha_inicio:
            queryset = queryset.filter(fecha_pedido__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(fecha_pedido__lte=fecha_fin)
        
        # Estadísticas generales
        stats = {
            'ventas_totales': queryset.aggregate(Sum('total'))['total__sum'] or 0,
            'pedidos_totales': queryset.count(),
            'pedidos_pendientes': queryset.filter(estado='pendiente').count(),
            'pedidos_completados': queryset.filter(estado='entregado').count(),
            'ticket_promedio': queryset.aggregate(Avg('total'))['total__avg'] or 0,
        }
        
        # Productos más vendidos
        productos_vendidos = DetallePedido.objects.filter(
            pedido__in=queryset
        ).values('platillo__nombre').annotate(
            cantidad_total=Sum('cantidad'),
            venta_total=Sum('subtotal')
        ).order_by('-venta_total')[:5]
        
        return Response({
            'estadisticas': stats,
            'productos_mas_vendidos': list(productos_vendidos)
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def chefs(self, request):
        """Retorna solo los usuarios que son chefs"""
        chefs = self.get_queryset().filter(es_chef=True)
        serializer = self.get_serializer(chefs, many=True)
        return Response(serializer.data)
    
# sabores/views.py

class VerificarPreguntaSeguridadView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        try:
            usuario = User.objects.get(username=username)
            if usuario.pregunta_seguridad:
                return Response({
                    'pregunta': usuario.pregunta_seguridad,
                    'usuario_id': usuario.id
                })
            else:
                return Response({
                    'error': 'Este usuario no tiene pregunta de seguridad configurada'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

class RecuperarPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        usuario_id = request.data.get('usuario_id')
        respuesta = request.data.get('respuesta')
        nueva_password = request.data.get('nueva_password')
        
        try:
            usuario = User.objects.get(id=usuario_id)
            # Comparar respuesta (en minúsculas para evitar problemas de mayúsculas)
            if usuario.respuesta_seguridad.lower() == respuesta.lower():
                usuario.set_password(nueva_password)
                usuario.save()
                return Response({'mensaje': 'Contraseña actualizada exitosamente'})
            else:
                return Response({
                    'error': 'Respuesta incorrecta'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
            
            
class MetodoPagoViewSet(viewsets.ModelViewSet):
    serializer_class = MetodoPagoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MetodoPago.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class TicketSoporteViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSoporteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TicketSoporte.objects.filter(usuario=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class ResenaViewSet(viewsets.ModelViewSet):
    serializer_class = ResenaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Resena.objects.filter(cliente=self.request.user)
        pedido_id = self.request.query_params.get('pedido', None)
        
        # Filtrar específicamente por pedido si se proporciona
        if pedido_id:
            queryset = queryset.filter(pedido_id=pedido_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)