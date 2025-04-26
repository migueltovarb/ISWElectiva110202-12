from rest_framework import serializers
from .models import Cart, CartItem
from apps.menu.serializers import MenuItemSerializer

class CartItemSerializer(serializers.ModelSerializer):
    menu_item_details = MenuItemSerializer(source='menu_item', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ('id', 'menu_item', 'menu_item_details', 'quantity', 'notes', 'subtotal', 'added_at')
        read_only_fields = ('subtotal', 'added_at')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ('id', 'user', 'items', 'total_items', 'total_amount', 'created_at', 'updated_at')
        read_only_fields = ('user', 'created_at', 'updated_at')


class AddToCartSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(max_length=255, required=False, allow_blank=True)
    
    def validate_menu_item_id(self, value):
        from apps.menu.models import MenuItem
        try:
            menu_item = MenuItem.objects.get(id=value)
            if not menu_item.is_available:
                raise serializers.ValidationError("Este producto no está disponible actualmente.")
            return value
        except MenuItem.DoesNotExist:
            raise serializers.ValidationError("El producto no existe.")


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)  # 0 para eliminar
    notes = serializers.CharField(max_length=255, required=False, allow_blank=True)