from django.db import models

class Tarea(models.Model):
    ESTADOS = [
        ('Pendiente', 'Pendiente'),
        ('En progreso', 'En progreso'),
        ('Completada', 'Completada'),
    ]

    nombre = models.CharField(max_length=100)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='Pendiente')
    creado = models.DateTimeField(auto_now_add=True)
    modificado = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre
