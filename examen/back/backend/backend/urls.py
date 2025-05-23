from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('AppBackend.urls')),  # <-- Asegúrate de importar bien la app
]
