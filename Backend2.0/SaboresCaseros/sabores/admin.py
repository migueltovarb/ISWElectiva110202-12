# sabores/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Usuario, Categoria, Platillo, Pedido, DetallePedido,
    MetodoPago, TicketSoporte, MensajeSoporte, Resena
)

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'es_chef', 'is_staff')
    list_filter = ('es_chef', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('es_chef', 'telefono', 'direccion', 'foto_perfil')}),
    )

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(Platillo)
class PlatilloAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'chef', 'categoria', 'precio', 'disponible')
    list_filter = ('disponible', 'categoria', 'chef')
    search_fields = ('nombre', 'descripcion')
    list_editable = ('disponible', 'precio')
    
@admin.register(MetodoPago)
class MetodoPagoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'tipo', 'numero_tarjeta', 'es_predeterminado', 'creado_en')
    list_filter = ('tipo', 'es_predeterminado')
    search_fields = ('usuario__username', 'usuario__email', 'nombre_titular')

@admin.register(TicketSoporte)
class TicketSoporteAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'asunto', 'estado', 'prioridad', 'creado_en')
    list_filter = ('estado', 'prioridad', 'creado_en')
    search_fields = ('asunto', 'mensaje', 'usuario__username')

@admin.register(MensajeSoporte)
class MensajeSoporteAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'usuario', 'es_staff', 'creado_en')
    list_filter = ('es_staff', 'creado_en')
    search_fields = ('mensaje', 'usuario__username')

@admin.register(Resena)
class ResenaAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'pedido', 'calificacion', 'fecha', 'aprobada')  # Removido 'platillo'
    list_filter = ('calificacion', 'aprobada', 'fecha')
    search_fields = ('cliente__username', 'pedido__id', 'comentario')  # Actualizado para buscar por pedido
    readonly_fields = ('fecha',)