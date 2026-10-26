from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer

class CustomLoginView(TokenObtainPairView):
    """
    Standard login endpoint returning JWT tokens and user metadata.
    """
    serializer_class = CustomTokenObtainPairSerializer

class CurrentUserView(APIView):
    """
    Returns the authenticated user's profile and active permissions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListView(generics.ListAPIView):
    """
    Lists users for responder assignments. Accessible by Coordinators and Admins.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        role_filter = self.request.query_params.get('role')
        qs = User.objects.filter(is_active=True)
        if role_filter:
            qs = qs.filter(role=role_filter)
        return qs.order_by('username')
