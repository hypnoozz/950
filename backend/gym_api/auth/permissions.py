from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    仅管理员可以修改，其他用户只能查看
    """
    def has_permission(self, request, view):
        # 允许所有用户查看
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 仅允许管理员修改
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    仅管理员或资源所有者可以访问
    """
    def has_object_permission(self, request, view, obj):
        # 检查对象是否有用户属性
        if hasattr(obj, 'user'):
            return request.user.role == 'admin' or obj.user == request.user
        
        # 对于用户对象本身
        return request.user.role == 'admin' or obj == request.user

class IsStaffOrAdmin(permissions.BasePermission):
    """
    仅员工或管理员可以访问
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['staff', 'admin']

class IsAdmin(permissions.BasePermission):
    """
    仅管理员可以访问
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin' 