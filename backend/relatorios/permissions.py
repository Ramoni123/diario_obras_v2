from rest_framework import permissions

class IsAdminOrSuperuser(permissions.BasePermission):
    """
    Permissão que permite acesso apenas a superusuários ou usuários
    no grupo 'Administradores'.
    """
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_superuser or
            request.user.groups.filter(name='Administradores').exists()
        )