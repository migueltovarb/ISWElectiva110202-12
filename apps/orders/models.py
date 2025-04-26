import uuid
from django.db import models
from django.conf import settings
from apps.menu.models import MenuItem

class Order(models.Model):
    STATUS_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('en_preparacion', 'En Preparación'),
        ('en_camino', 'En Camino'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('efectivo', 'Efectivo'),
        ('tarjeta', 'Tarjeta'),
        ('transferencia', 'Transferencia'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('completado', 'Completado'),
        ('fallido', 'Fallido'),
        ('reembolsado', 'Reembolsado'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_code = models.CharField(max_length=20, unique=True, editable=False)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pendiente')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = models.TextField()
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)
    payment_status = models.CharField(max_length=15, choices=PAYMENT_STATUS_CHOICES, default='pendiente')
    notes = models.TextField(blank=True, null=True)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.order_code:
            # Generar código único para el pedido
            prefix = 'SC'  # Sabores Caseros
            unique_id = str(uuid.uuid4()).split('-')[0]
            self.order_code = f"{prefix}{unique_id.upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Pedido {self.order_code} - {self.user.name}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pedido'
        verbose_name_plural = 'Pedidos'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Precio al momento de la compra
    notes = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} en Pedido {self.order.order_code}"
    
    class Meta:
        verbose_name = 'Ítem de pedido'
        verbose_name_plural = 'Ítems de pedido'
        
# Añadir estos modelos al archivo models.py existente

class Cart(models.Model):
    """Modelo para representar un carrito de compras"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Carrito de {self.user.name}"
    
    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())
    
    @property
    def total_amount(self):
        return sum(item.subtotal for item in self.items.all())
    
    class Meta:
        verbose_name = 'Carrito'
        verbose_name_plural = 'Carritos'


class CartItem(models.Model):
    """Modelo para representar un ítem en el carrito"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey('menu.MenuItem', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"
    
    @property
    def subtotal(self):
        return self.menu_item.price * self.quantity
    
    class Meta:
        verbose_name = 'Ítem de carrito'
        verbose_name_plural = 'Ítems de carrito'
        unique_together = ('cart', 'menu_item')