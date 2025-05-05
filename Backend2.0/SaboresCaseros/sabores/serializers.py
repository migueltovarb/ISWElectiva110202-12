# sabores/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Usuario, Categoria, Platillo, DetallePedido, Pedido, Resena, MetodoPago, MensajeSoporte, TicketSoporte

User = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    pregunta_seguridad = serializers.CharField(required=False)
    respuesta_seguridad = serializers.CharField(write_only=True, required=False)
    foto_perfil = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Usuario
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_staff', 'es_chef', 
                'telefono', 'direccion', 'foto_perfil', 'pregunta_seguridad', 
                'respuesta_seguridad')  
        read_only_fields = ('id', 'username', 'is_staff', 'es_chef')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'foto_perfil': {'required': False},
            'email': {'required': True}
        }
        
    def create(self, validated_data):
        respuesta = validated_data.pop('respuesta_seguridad', None)
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        if respuesta:
            user.respuesta_seguridad = respuesta.lower()
            user.save()
        return user
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        respuesta = validated_data.pop('respuesta_seguridad', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        if respuesta:
            instance.respuesta_seguridad = respuesta.lower()
        
        instance.save()
        return instance

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class PlatilloSerializer(serializers.ModelSerializer):
    chef_nombre = serializers.CharField(source='chef.username', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Platillo
        fields = '__all__'
        

class DetallePedidoSerializer(serializers.ModelSerializer):
    platillo_nombre = serializers.CharField(source='platillo.nombre', read_only=True)
    
    class Meta:
        model = DetallePedido
        fields = ['id', 'platillo', 'cantidad', 'precio_unitario', 'subtotal', 'platillo_nombre']
        read_only_fields = ['id', 'subtotal', 'platillo_nombre']
        extra_kwargs = {
            'platillo': {'required': True},
            'cantidad': {'required': True},
            'precio_unitario': {'required': True}
        }

class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    cliente_nombre = serializers.CharField(source='cliente.username', read_only=True)
    cliente_email = serializers.CharField(source='cliente.email', read_only=True)
    cliente_telefono = serializers.CharField(source='cliente.telefono', read_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'cliente_nombre', 'cliente_email', 'cliente_telefono',
                    'fecha_pedido', 'fecha_entrega', 'estado', 'direccion_entrega', 
                    'total', 'tipo_pago', 'notas', 'detalles']
        read_only_fields = ['id', 'cliente', 'fecha_pedido', 'cliente_nombre', 
                            'cliente_email', 'cliente_telefono']
    
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        pedido = Pedido.objects.create(**validated_data)
        
        for detalle_data in detalles_data:
            subtotal = detalle_data['cantidad'] * detalle_data['precio_unitario']
            DetallePedido.objects.create(
                pedido=pedido,
                subtotal=subtotal,
                **detalle_data
            )
        
        return pedido
    
    def validate_detalles(self, value):
        """Validar que hay al menos un detalle"""
        if not value:
            raise serializers.ValidationError("El pedido debe tener al menos un producto")
        return value
    
class MetodoPagoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = MetodoPago
        fields = '__all__'
        read_only_fields = ('usuario',)

class MensajeSoporteSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = MensajeSoporte
        fields = ['id', 'ticket', 'usuario', 'usuario_nombre', 'mensaje', 'fecha_envio']
        read_only_fields = ('usuario',)

class TicketSoporteSerializer(serializers.ModelSerializer):
    mensajes = MensajeSoporteSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    
    class Meta:
        model = TicketSoporte
        fields = '__all__'
        read_only_fields = ('usuario',)

class ResenaSerializer(serializers.ModelSerializer):
    cliente_nombre = serializers.CharField(source='cliente.username', read_only=True)
    
    class Meta:
        model = Resena
        fields = ['id', 'cliente', 'cliente_nombre', 'pedido', 
                'calificacion', 'comentario', 'fecha', 'aprobada']
        read_only_fields = ['id', 'cliente', 'fecha', 'aprobada']