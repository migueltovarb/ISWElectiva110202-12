from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'name', 'role', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'name', 'phone')
    readonly_fields = ('date_joined',)
    ordering = ('-date_joined',)
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Información personal'), {'fields': ('name', 'phone', 'address')}),
        (_('Permisos'), {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Fechas importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'role', 'is_active', 'is_staff'),
        }),
    )