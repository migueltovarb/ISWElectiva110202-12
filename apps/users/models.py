from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('El correo electrónico es obligatorio'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser debe tener is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser debe tener is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('cliente', 'Cliente'),
        ('admin', 'Administrador'),
        ('staff', 'Personal')
    )

    email = models.EmailField(_('correo electrónico'), unique=True)
    name = models.CharField(_('nombre'), max_length=100)
    phone = models.CharField(_('teléfono'), max_length=15, blank=True, null=True)
    address = models.TextField(_('dirección'), blank=True, null=True)
    role = models.CharField(_('rol'), max_length=10, choices=ROLE_CHOICES, default='cliente')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = _('usuario')
        verbose_name_plural = _('usuarios')