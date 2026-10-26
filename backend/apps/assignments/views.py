from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Assignment, AssignmentStatus
from .serializers import AssignmentSerializer
from assistance.models import RequestStatus
from accounts.permissions import IsCoordinatorOrAbove
from audit.logger import log_audit_event

class AssignmentViewSet(viewsets.ModelViewSet):
    """
    CRUD and workflow state transitions for responder team dispatches.
    """
    queryset = Assignment.objects.all().order_by('-assigned_at')
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'assigned_responder', 'team_name']

    def perform_create(self, serializer):
        assignment = serializer.save(assigned_by=self.request.user)
        # Update corresponding request status
        req = assignment.request
        req.status = RequestStatus.ASSIGNED
        req.save()

        log_audit_event(
            actor=self.request.user,
            action="DISPATCH_RESPONDER_TEAM",
            entity_type="Assignment",
            entity_id=str(assignment.id),
            reason=f"Dispatched {assignment.team_name} to request {req.public_ref}.",
            change_summary={"team": assignment.team_name, "request": req.public_ref}
        )

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        assignment = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if new_status not in AssignmentStatus.values:
            return Response(
                {"detail": f"Invalid status '{new_status}'. Allowed: {AssignmentStatus.values}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = assignment.status
        assignment.status = new_status
        if notes:
            assignment.notes = f"{assignment.notes}\n[{timezone.now().strftime('%H:%M')}] {notes}".strip()

        if new_status == AssignmentStatus.ACKNOWLEDGED:
            assignment.acknowledged_at = timezone.now()
        elif new_status == AssignmentStatus.COMPLETED:
            assignment.completed_at = timezone.now()
            # Also update assistance request to EVACUATED
            req = assignment.request
            req.status = RequestStatus.EVACUATED
            req.save()
        elif new_status == AssignmentStatus.EN_ROUTE:
            req = assignment.request
            req.status = RequestStatus.IN_PROGRESS
            req.save()

        assignment.save()

        log_audit_event(
            actor=request.user,
            action="UPDATE_ASSIGNMENT_STATUS",
            entity_type="Assignment",
            entity_id=str(assignment.id),
            reason=f"Transition from {old_status} to {new_status}. Notes: {notes}",
            change_summary={"old_status": old_status, "new_status": new_status}
        )

        return Response(AssignmentSerializer(assignment).data)
