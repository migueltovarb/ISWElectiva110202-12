from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer
from .permissions import IsAdminOrStaff

class CategoryAdminListCreateView(generics.ListCreateAPIView):
    """
    API para que los administradores listen y creen categorías.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]  # Para manejar imágenes


class CategoryAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API para que los administradores actualicen y eliminen categorías.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]


class MenuItemAdminListCreateView(generics.ListCreateAPIView):
    """
    API para que los administradores listen y creen ítems del menú.
    """
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]


class MenuItemAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API para que los administradores actualicen y eliminen ítems del menú.
    """
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser]


class MenuItemBulkStatusUpdateView(generics.GenericAPIView):
    """
    API para actualizar el estado (disponible/destacado) de múltiples ítems a la vez.
    """
    permission_classes = [IsAdminOrStaff]
    
    def post(self, request):
        item_ids = request.data.get('item_ids', [])
        action = request.data.get('action')
        value = request.data.get('value', True)
        
        if not item_ids or not action or action not in ['set_available', 'set_featured']:
            return Response(
                {"detail": "Datos inválidos. Se requieren item_ids y action válida."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items = MenuItem.objects.filter(id__in=item_ids)
        if action == 'set_available':
            items.update(is_available=value)
        elif action == 'set_featured':
            items.update(is_featured=value)
        
        return Response({"detail": f"Se actualizaron {items.count()} ítems."})