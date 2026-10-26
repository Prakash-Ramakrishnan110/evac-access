from rest_framework import generics, permissions
from .models import AuditEvent
from .serializers import AuditEventSerializer
from accounts.permissions import IsReviewerOrAbove

class AuditEventListView(generics.ListAPIView):
    """
    Read-only view of audit trail for Reviewers, Coordinators, and Admins.
    """
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsReviewerOrAbove]
    filterset_fields = ['action', 'entity_type', 'entity_id']
    search_fields = ['actor_name', 'action', 'entity_id', 'reason']

    def get_queryset(self):
        return AuditEvent.objects.all().order_by('-timestamp')
