from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name="Imagen")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['name']


class MenuItem(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True, verbose_name="Imagen")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='menu_items', verbose_name="Categoría")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")
    is_featured = models.BooleanField(default=False, verbose_name="Destacado")
    preparation_time = models.PositiveIntegerField(help_text='Tiempo de preparación en minutos', default=15, verbose_name="Tiempo de preparación")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = 'Ítem del menú'
        verbose_name_plural = 'Ítems del menú'
        ordering = ['category', 'name']