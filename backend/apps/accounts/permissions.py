from rest_framework import permissions
from .models import UserRole

class IsAdminRole(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role())

class IsCoordinatorOrAbove(permissions.BasePermission):
    """Allows access to Incident Coordinators, Administrators, and superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_coordinator_or_above())

class IsReviewerOrAbove(permissions.BasePermission):
    """Allows access to Reviewers/Supervisors, Coordinators, and Admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_reviewer_or_above())

class IsResponderOrAbove(permissions.BasePermission):
    """Allows access to Field Responders, Coordinators, and Admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class CanVerifyShelter(permissions.BasePermission):
    """Only Reviewers, Coordinators, and Admins can formally mark a shelter as VERIFIED."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_reviewer_or_above())
