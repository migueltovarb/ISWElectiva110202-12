from rest_framework import permissions

class IsAdminOrStaff(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a administradores y personal.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role in ['admin', 'staff'] or 
            request.user.is_superuser
        )