from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import FieldReport, ReportStatus
from .serializers import FieldReportSerializer
from accounts.permissions import IsReviewerOrAbove
from audit.logger import log_audit_event

class FieldReportViewSet(viewsets.ModelViewSet):
    """
    Field reports intake endpoint with offline idempotency handling.
    """
    queryset = FieldReport.objects.all().order_by('-observed_at')
    serializer_class = FieldReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['incident', 'report_type', 'status']

    def create(self, request, *args, **kwargs):
        idempotency_key = request.data.get('idempotency_key')
        if idempotency_key:
            existing = FieldReport.objects.filter(idempotency_key=idempotency_key).first()
            if existing:
                # Return existing record idempotently
                serializer = self.get_serializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(author=request.user)

        log_audit_event(
            actor=request.user,
            action="SUBMIT_FIELD_REPORT",
            entity_type="FieldReport",
            entity_id=str(report.id),
            reason=f"Field report submitted: {report.title} ({report.get_report_type_display()}).",
            change_summary={"type": report.report_type, "location": [report.latitude, report.longitude]}
        )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsReviewerOrAbove])
    def review(self, request, pk=None):
        report = self.get_object()
        new_status = request.data.get('status')
        review_notes = request.data.get('review_notes', '')

        if new_status not in [ReportStatus.ACCEPTED, ReportStatus.REJECTED]:
            return Response(
                {"detail": "Status must be either 'ACCEPTED' or 'REJECTED'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.status = new_status
        report.reviewed_by = request.user
        report.review_notes = review_notes
        report.save()

        log_audit_event(
            actor=request.user,
            action="REVIEW_FIELD_REPORT",
            entity_type="FieldReport",
            entity_id=str(report.id),
            reason=f"Field report marked as {new_status}. Review notes: {review_notes}"
        )

        return Response(FieldReportSerializer(report).data)
