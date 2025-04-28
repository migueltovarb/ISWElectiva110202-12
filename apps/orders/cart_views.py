from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem
from apps.menu.models import MenuItem
from .cart_serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToCartView(APIView):
    """
    Endpoint para añadir un producto al carrito.
    
    POST: Añadir un nuevo ítem al carrito o actualizar la cantidad si ya existe
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            menu_item_id = serializer.validated_data['menu_item_id']
            quantity = serializer.validated_data['quantity']
            notes = serializer.validated_data.get('notes', '')
            
            # Obtener o crear el carrito
            cart, created = Cart.objects.get_or_create(user=request.user)
            menu_item = get_object_or_404(MenuItem, id=menu_item_id)
            
            # Verificar si el ítem ya está en el carrito
            cart_item, item_created = CartItem.objects.get_or_create(
                cart=cart,
                menu_item=menu_item,
                defaults={'quantity': quantity, 'notes': notes}
            )
            
            # Si el ítem ya existía, actualizar cantidad y notas
            if not item_created:
                cart_item.quantity += quantity
                cart_item.notes = notes if notes else cart_item.notes
                cart_item.save()
            
            # Actualizar timestamp del carrito
            cart.save()
            
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartItemView(APIView):
    """
    Endpoint para gestionar un ítem específico del carrito.
    
    PUT: Actualizar cantidad y notas
    DELETE: Eliminar el ítem del carrito
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            try:
                cart_item = CartItem.objects.get(id=item_id, cart=cart)
                quantity = serializer.validated_data['quantity']
                
                # Si la cantidad es 0, eliminar el ítem
                if quantity == 0:
                    cart_item.delete()
                else:
                    cart_item.quantity = quantity
                    if 'notes' in serializer.validated_data:
                        cart_item.notes = serializer.validated_data['notes']
                    cart_item.save()
                
                # Actualizar timestamp del carrito
                cart.save()
                
                return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
            except CartItem.DoesNotExist:
                return Response(
                    {"detail": "Ítem no encontrado en el carrito"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, item_id):
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            
            # Actualizar timestamp del carrito
            cart.save()
            
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Ítem no encontrado en el carrito"}, 
                status=status.HTTP_404_NOT_FOUND
            )