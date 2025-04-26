from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_code', 'user', 'status', 'total_amount', 'payment_method', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_method', 'payment_status')
    search_fields = ('order_code', 'user__name', 'user__email', 'delivery_address')
    readonly_fields = ('order_code', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    list_editable = ('status', 'payment_status')
    ordering = ('-created_at',)
    fieldsets = (
        ('Información básica', {
            'fields': ('order_code', 'user', 'status', 'total_amount')
        }),
        ('Envío y pago', {
            'fields': ('delivery_address', 'payment_method', 'payment_status', 'estimated_delivery_time')
        }),
        ('Notas', {
            'fields': ('notes',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at')
        }),
    )