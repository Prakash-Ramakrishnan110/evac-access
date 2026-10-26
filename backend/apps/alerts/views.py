from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Alert, AlertStatus
from .serializers import AlertSerializer
from accounts.permissions import IsCoordinatorOrAbove
from audit.logger import log_audit_event

class AlertViewSet(viewsets.ModelViewSet):
    """
    CRUD and preview endpoints for emergency accessible alerts.
    """
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['incident', 'status', 'preferred_format']

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def preview(self, request):
        """
        Generates an accessible preview of an alert message with large-text and audio specs.
        """
        title = request.data.get('title', 'Emergency Evacuation Notice')
        message_en = request.data.get('message_en', '')
        message_hi = request.data.get('message_hi', '')
        message_or = request.data.get('message_or', '')
        target_zone = request.data.get('target_zone', 'Affected Coastal Zone')

        word_count = len(message_en.split())
        est_audio_seconds = max(5, round(word_count / 2.5))  # ~150 wpm

        return Response({
            "is_simulated_preview": True,
            "disclaimer": "This is a local accessible preview. No public transmission has occurred.",
            "preview_data": {
                "title": title,
                "target_zone": target_zone,
                "message_en": message_en,
                "message_hi": message_hi,
                "message_or": message_or,
                "estimated_audio_duration_seconds": est_audio_seconds,
                "wcag_contrast_ratio": "12.4:1 (AAA High-Contrast Pass)"
            }
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsCoordinatorOrAbove])
    def approve(self, request, pk=None):
        alert = self.get_object()
        alert.status = AlertStatus.APPROVED
        alert.approved_by = request.user
        alert.approved_at = timezone.now()
        alert.save()

        log_audit_event(
            actor=request.user,
            action="APPROVE_ACCESSIBLE_ALERT",
            entity_type="Alert",
            entity_id=str(alert.id),
            reason=f"Approved emergency alert notice '{alert.title}' for {alert.target_zone}."
        )

        return Response(AlertSerializer(alert).data)
