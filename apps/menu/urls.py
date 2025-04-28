from django.urls import path
from .views import (
    CategoryListView, 
    MenuItemListView, 
    MenuItemDetailView, 
    FeaturedMenuItemsView
)
from .admin_views import (
    CategoryAdminListCreateView,
    CategoryAdminDetailView,
    MenuItemAdminListCreateView,
    MenuItemAdminDetailView,
    MenuItemBulkStatusUpdateView
)

app_name = 'menu'


urlpatterns = [
    # Endpoints públicos
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('items/', MenuItemListView.as_view(), name='menuitem-list'),
    path('items/<int:pk>/', MenuItemDetailView.as_view(), name='menuitem-detail'),
    path('featured/', FeaturedMenuItemsView.as_view(), name='featured-items'),
    
    # Endpoints de administración
    path('admin/categories/', CategoryAdminListCreateView.as_view(), name='admin-category-list'),
    path('admin/categories/<int:pk>/', CategoryAdminDetailView.as_view(), name='admin-category-detail'),
    path('admin/items/', MenuItemAdminListCreateView.as_view(), name='admin-menuitem-list'),
    path('admin/items/<int:pk>/', MenuItemAdminDetailView.as_view(), name='admin-menuitem-detail'),
    path('admin/items/bulk-update/', MenuItemBulkStatusUpdateView.as_view(), name='admin-menuitem-bulk-update'),
]