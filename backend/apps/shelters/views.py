from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Shelter, ShelterFeature, ShelterInspection, ShelterReviewStatus, FeatureValue
from .serializers import ShelterSerializer, ShelterInspectionSerializer
from accounts.permissions import IsCoordinatorOrAbove, CanVerifyShelter
from audit.logger import log_audit_event

class ShelterViewSet(viewsets.ModelViewSet):
    """
    Endpoints for shelter directory, accessibility queries, inspections and reviews.
    """
    queryset = Shelter.objects.all().order_by('code')
    serializer_class = ShelterSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['incident', 'operating_status', 'review_status']
    search_fields = ['name', 'code', 'address']

    def get_queryset(self):
        qs = super().get_queryset()
        # Filter by required feature e.g. ?has_feature=wheelchair_ramp:YES
        feature_filter = self.request.query_params.get('feature')
        if feature_filter:
            qs = qs.filter(features__feature_key=feature_filter, features__value=FeatureValue.YES)
        return qs

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit_inspection(self, request, pk=None):
        """
        Field responder submits an inspection with Yes/No/Unknown feature evaluations.
        """
        shelter = self.get_object()
        findings = request.data.get('findings', [])
        notes = request.data.get('notes', '')
        capacity_occupied = request.data.get('capacity_occupied', shelter.capacity_occupied)

        inspection = ShelterInspection.objects.create(
            shelter=shelter,
            inspector=request.user,
            capacity_occupied=capacity_occupied,
            findings_json=findings,
            notes=notes,
            status='PENDING_REVIEW'
        )

        log_audit_event(
            actor=request.user,
            action="SUBMIT_SHELTER_INSPECTION",
            entity_type="Shelter",
            entity_id=str(shelter.id),
            reason=f"Field inspection submitted with {len(findings)} evaluated features.",
            change_summary={"inspection_id": str(inspection.id), "notes": notes}
        )

        return Response(
            {"message": "Inspection submitted and placed in review queue.", "inspection": ShelterInspectionSerializer(inspection).data},
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, CanVerifyShelter])
    def verify(self, request, pk=None):
        """
        Supervisor marks shelter features as formally VERIFIED based on inspection.
        """
        shelter = self.get_object()
        features_data = request.data.get('features', {})
        reason = request.data.get('reason', 'Supervisor verification completed.')

        for key, val in features_data.items():
            feat, _ = ShelterFeature.objects.get_or_create(shelter=shelter, feature_key=key)
            feat.value = val
            feat.verified_by = request.user
            feat.verified_at = timezone.now()
            feat.save()

        shelter.review_status = ShelterReviewStatus.VERIFIED
        shelter.last_verified_at = timezone.now()
        shelter.verified_by = request.user
        shelter.save()

        log_audit_event(
            actor=request.user,
            action="VERIFY_SHELTER",
            entity_type="Shelter",
            entity_id=str(shelter.id),
            reason=reason,
            change_summary={"features_updated": list(features_data.keys()), "review_status": "VERIFIED"}
        )

        return Response({"message": f"Shelter {shelter.code} successfully marked as VERIFIED.", "shelter": ShelterSerializer(shelter).data})
