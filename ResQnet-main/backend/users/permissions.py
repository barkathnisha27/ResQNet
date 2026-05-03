"""
Role-based permission classes for the authentication system.
"""

from rest_framework import permissions


class IsCitizen(permissions.BasePermission):
    """
    Permission class to check if the user is authenticated and has citizen role.
    """
    message = 'Only citizens can access this resource.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'citizen'
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'citizen'
        )


class IsNGO(permissions.BasePermission):
    """
    Permission class to check if the user is authenticated and has NGO role.
    """
    message = 'Only NGO members can access this resource.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ngo'
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ngo'
        )


class IsGovernment(permissions.BasePermission):
    """
    Permission class to check if the user is authenticated and has government role.
    """
    message = 'Only government officials can access this resource.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'government'
        )

    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'government'
        )


class IsAnonymous(permissions.BasePermission):
    """
    Permission class to check if the user is NOT authenticated.
    Used for registration and login endpoints.
    """

    def has_permission(self, request, view):
        return not request.user or not request.user.is_authenticated
