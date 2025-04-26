from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Sabores Caseros API",
        default_version='v1',
        description="API para la gestión de pedidos del restaurante Sabores Caseros",
        contact=openapi.Contact(email="contact@saborescaseros.com"),
        license=openapi.License(name="Licencia Privada"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/users/', include('apps.users.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/menu/', include('apps.menu.urls')),
    
    # Documentación de la API
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Añadir URLs para archivos estáticos y media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)