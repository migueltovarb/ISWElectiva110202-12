import django_filters
from .models import MenuItem

class MenuItemFilter(django_filters.FilterSet):
    """Filtros para los ítems del menú"""
    category = django_filters.NumberFilter(field_name='category__id')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    class Meta:
        model = MenuItem
        fields = ['category', 'is_featured', 'is_available']