from rest_framework import serializers
from .models import Order, OrderItem
from apps.menu.models import MenuItem
from apps.menu.serializers import MenuItemSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)
    menu_item_details = MenuItemSerializer(source='menu_item', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'menu_item', 'menu_item_name', 'menu_item_price', 'menu_item_details', 'quantity', 'price', 'notes')
        read_only_fields = ('price',)


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('menu_item', 'quantity', 'notes')
    
    def validate_menu_item(self, value):
        if not value.is_available:
            raise serializers.ValidationError("Este producto no está disponible actualmente.")
        return value


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'order_code', 'user', 'user_name', 'status', 'status_display', 
            'total_amount', 'delivery_address', 'payment_method', 'payment_method_display',
            'payment_status', 'payment_status_display', 'notes',
            'estimated_delivery_time', 'created_at', 'updated_at', 'items'
        )
        read_only_fields = ('order_code', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)
    
    class Meta:
        model = Order
        fields = (
            'delivery_address', 'payment_method', 'notes', 'items'
        )
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        total_amount = 0
        
        # Calcular monto total
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data['quantity']
            total_amount += menu_item.price * quantity
        
        # Crear orden
        order = Order.objects.create(
            user=self.context['request'].user,
            total_amount=total_amount,
            **validated_data
        )
        
        # Crear ítems de la orden
        for item_data in items_data:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                price=menu_item.price,
                **item_data
            )
        
        return order


class OrderStatusSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'order_code', 'status', 'status_display', 'payment_status', 
            'payment_status_display', 'estimated_delivery_time', 'created_at'
        )
        read_only_fields = fields
        

class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES, required=False)
    payment_status = serializers.ChoiceField(choices=Order.PAYMENT_STATUS_CHOICES, required=False)
    estimated_delivery_time = serializers.DateTimeField(required=False)
    
    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Debe proporcionar al menos un campo para actualizar.")
        return attrs