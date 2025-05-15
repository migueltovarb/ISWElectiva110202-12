# sabores/models.py

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    es_chef = models.BooleanField(default=False)
    telefono = models.CharField(max_length=15, blank=True)
    direccion = models.TextField(blank=True)
    foto_perfil = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    
    pregunta_seguridad = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Pregunta de seguridad para recuperar contraseña"
    )
    respuesta_seguridad = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Respuesta a la pregunta de seguridad"
    )
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = "Usuarios"
    def __str__(self):
        return self.username

class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    
    def __str__(self):
        return self.nombre

class Platillo(models.Model):
    chef = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='platillos')
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True)
    imagen_principal = models.ImageField(upload_to='platillos/')
    disponible = models.BooleanField(default=True)
    tiempo_preparacion = models.IntegerField(help_text="Tiempo en minutos")
    
    def __str__(self):
        return self.nombre
    

class Pedido(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('confirmado', 'Confirmado'),
        ('preparando', 'Preparando'),
        ('listo', 'Listo para entrega'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]
    
    cliente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pedidos')
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    fecha_entrega = models.DateTimeField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    direccion_entrega = models.TextField()
    total = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_pago = models.CharField(
        max_length=20, 
        choices=[
            ('tarjeta', 'Tarjeta de Crédito/Débito'),
            ('efectivo', 'Efectivo'),
            ('transferencia', 'Transferencia')
        ],
        null=True,
        blank=True
    )
    notas = models.TextField(blank=True)
    
    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.username}"

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles')
    platillo = models.ForeignKey(Platillo, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        if not self.subtotal:  # Solo calcula si no está establecido
            self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)
        

class MetodoPago(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='metodos_pago')
    tipo = models.CharField(max_length=20, choices=[
        ('tarjeta', 'Tarjeta de Crédito/Débito'),
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia')
    ])
    numero_tarjeta = models.CharField(max_length=4, blank=True, null=True)  # Solo últimos 4 dígitos
    nombre_titular = models.CharField(max_length=100, blank=True, null=True)
    fecha_expiracion = models.CharField(max_length=5, blank=True, null=True)  # MM/YY
    es_predeterminado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-es_predeterminado', '-creado_en']
        verbose_name = 'Método de Pago'
        verbose_name_plural = 'Métodos de Pago'
    
    def __str__(self):
        if self.tipo == 'tarjeta':
            return f"Tarjeta ****{self.numero_tarjeta}"
        return self.get_tipo_display()

class TicketSoporte(models.Model):
    ESTADO_CHOICES = [
        ('abierto', 'Abierto'),
        ('en_proceso', 'En Proceso'),
        ('resuelto', 'Resuelto'),
        ('cerrado', 'Cerrado')
    ]
    
    PRIORIDAD_CHOICES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta')
    ]
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets_soporte')
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE, null=True, blank=True, related_name='tickets')
    asunto = models.CharField(max_length=200)
    mensaje = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='abierto')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='media')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-creado_en']
        verbose_name = 'Ticket de Soporte'
        verbose_name_plural = 'Tickets de Soporte'
    
    def __str__(self):
        return f"Ticket #{self.id} - {self.asunto}"

class MensajeSoporte(models.Model):
    ticket = models.ForeignKey(TicketSoporte, on_delete=models.CASCADE, related_name='mensajes')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    mensaje = models.TextField()
    es_staff = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['creado_en']
        verbose_name = 'Mensaje de Soporte'
        verbose_name_plural = 'Mensajes de Soporte'
    
    def __str__(self):
        return f"Mensaje de {self.usuario.username} en Ticket #{self.ticket.id}"

class Resena(models.Model):
    cliente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resenas')
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE, related_name='resenas')
    calificacion = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comentario = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    aprobada = models.BooleanField(default=True)  # Puedes cambiar a False si quieres moderación
    
    class Meta:
        unique_together = ['cliente', 'pedido']
        ordering = ['-fecha']
        verbose_name = 'Reseña'
        verbose_name_plural = 'Reseñas'
    
    def __str__(self):
        return f"Reseña de {self.cliente.username} para Pedido #{self.pedido.id}"
