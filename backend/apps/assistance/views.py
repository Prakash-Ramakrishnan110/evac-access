from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AssistanceRequest, RequestStatus
from .serializers import AssistanceRequestSerializer
from accounts.permissions import IsCoordinatorOrAbove
from audit.logger import log_audit_event

class AssistanceRequestViewSet(viewsets.ModelViewSet):
    """
    CRUD and triage actions for emergency assistance requests.
    """
    queryset = AssistanceRequest.objects.all().order_by('-created_at')
    serializer_class = AssistanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['incident', 'urgency', 'status']
    search_fields = ['public_ref', 'approximate_address', 'operational_notes']

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsCoordinatorOrAbove])
    def update_status(self, request, pk=None):
        """
        Transition assistance request status with audit tracking.
        """
        req_obj = self.get_object()
        new_status = request.data.get('status')
        reason = request.data.get('reason', 'Status updated by coordinator.')

        if new_status not in RequestStatus.values:
            return Response(
                {"detail": f"Invalid status: '{new_status}'. Allowed: {RequestStatus.values}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = req_obj.status
        req_obj.status = new_status
        req_obj.save()

        log_audit_event(
            actor=request.user,
            action="UPDATE_REQUEST_STATUS",
            entity_type="AssistanceRequest",
            entity_id=req_obj.public_ref,
            reason=reason,
            change_summary={"old_status": old_status, "new_status": new_status}
        )

        return Response(AssistanceRequestSerializer(req_obj).data)
