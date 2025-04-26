from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer
from .filters import MenuItemFilter


class CategoryListView(generics.ListAPIView):
    """
    Endpoint para listar todas las categorías activas del menú.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class MenuItemListView(generics.ListAPIView):
    """
    Endpoint para listar los ítems del menú con opciones de filtrado:
    
    - ?category=id - Filtrar por categoría
    - ?featured=true - Mostrar solo destacados
    - ?available=true - Mostrar solo disponibles
    - ?search=texto - Buscar por nombre o descripción
    - ?min_price=X&max_price=Y - Filtrar por rango de precio
    """
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MenuItemFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name', 'preparation_time']
    ordering = ['category', 'name']
    
    def get_queryset(self):
        queryset = MenuItem.objects.select_related('category').all()
        
        # Filtro por disponibilidad
        available = self.request.query_params.get('available')
        if available is not None and available.lower() == 'true':
            queryset = queryset.filter(is_available=True)
        
        # Filtro por destacados
        featured = self.request.query_params.get('featured')
        if featured is not None and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
            
        return queryset


class MenuItemDetailView(generics.RetrieveAPIView):
    """
    Endpoint para obtener detalles de un ítem específico del menú.
    """
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]


class FeaturedMenuItemsView(generics.ListAPIView):
    """
    Endpoint para obtener solo los ítems destacados del menú.
    """
    queryset = MenuItem.objects.filter(is_featured=True, is_available=True)
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]