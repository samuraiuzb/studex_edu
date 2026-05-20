"""Custom permissions for MathTestUZ."""

from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    """Allow access only to users with role='teacher'."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'teacher'
        )


class IsStudent(BasePermission):
    """Allow access only to users with role='student'."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'student'
        )
