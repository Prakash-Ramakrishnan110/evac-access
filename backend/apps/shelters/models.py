from django.db import models
from django.utils import timezone
from django.conf import settings
from core.models import TimeStampedUUIDModel
from incidents.models import Incident

class FeatureValue(models.TextChoices):
    YES = 'YES', 'Yes / Verified Available'
    NO = 'NO', 'No / Confirmed Unavailable'
    UNKNOWN = 'UNKNOWN', 'Unknown / Not Verified'

class ShelterReviewStatus(models.TextChoices):
    UNVERIFIED = 'UNVERIFIED', 'Unverified'
    PENDING_REVIEW = 'PENDING_REVIEW', 'Pending Supervisor Review'
    VERIFIED = 'VERIFIED', 'Verified Accessible'
    STALE = 'STALE', 'Stale Verification Data'
    REJECTED = 'REJECTED', 'Rejected Findings'

class OperatingStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open & Accepting Evacuees'
    FULL = 'FULL', 'At Maximum Capacity'
    STANDBY = 'STANDBY', 'Standby Readiness'
    CLOSED = 'CLOSED', 'Temporarily Closed / Inundated'

class Shelter(TimeStampedUUIDModel):
    """
    Emergency shelter facility with detailed accessibility feature tracking.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='shelters')
    code = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()

    capacity_total = models.PositiveIntegerField(default=200)
    capacity_occupied = models.PositiveIntegerField(default=0)
    operating_status = models.CharField(
        max_length=20,
        choices=OperatingStatus.choices,
        default=OperatingStatus.OPEN,
        db_index=True
    )
    review_status = models.CharField(
        max_length=20,
        choices=ShelterReviewStatus.choices,
        default=ShelterReviewStatus.UNVERIFIED,
        db_index=True
    )
    last_verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_shelters'
    )
    source = models.CharField(max_length=150, default='ODRF Municipal Audit')
    contact_person = models.CharField(max_length=100, blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    notes = models.TextField(blank=True)

    @property
    def available_capacity(self) -> int:
        return max(0, self.capacity_total - self.capacity_occupied)

    @property
    def is_full(self) -> bool:
        return self.capacity_occupied >= self.capacity_total

    def get_feature_value(self, feature_key: str) -> str:
        """Helper to get a feature's YES/NO/UNKNOWN status."""
        feat = self.features.filter(feature_key=feature_key).first()
        return feat.value if feat else FeatureValue.UNKNOWN

    def __str__(self):
        return f"{self.code} - {self.name} [{self.get_review_status_display()}]"

class ShelterFeature(TimeStampedUUIDModel):
    """
    Individual accessibility feature attached to a shelter with evidence reference.
    """
    FEATURE_KEYS = [
        ('step_free_access', 'Step-Free Entrance / Ramp'),
        ('wheelchair_ramp', 'Graded Wheelchair Ramp with Handrails'),
        ('accessible_restroom', 'Wheelchair Accessible Toilet / Grab Bars'),
        ('backup_power_for_oxygen', 'Continuous Diesel Generator Backup for Oxygen / Medical Devices'),
        ('ground_floor_sheltering', 'Ground Floor Sheltering Space Available'),
        ('tactile_paving', 'Tactile Paving for Visually Impaired'),
        ('braille_signage', 'Braille and Raised Signage'),
        ('sign_language_support', 'Trained Sign Language Support On-Site'),
        ('refrigerated_medicine_storage', 'Refrigerated Storage for Insulin / Vital Meds'),
    ]

    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name='features')
    feature_key = models.CharField(max_length=60, choices=FEATURE_KEYS)
    value = models.CharField(max_length=15, choices=FeatureValue.choices, default=FeatureValue.UNKNOWN)
    evidence_note = models.TextField(blank=True)
    evidence_ref = models.CharField(max_length=200, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_features'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('shelter', 'feature_key')

    def __str__(self):
        return f"{self.shelter.code} - {self.feature_key}: {self.value}"

class ShelterInspection(TimeStampedUUIDModel):
    """
    Field inspection record submitted by a responder or municipal engineer.
    """
    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name='inspections')
    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='submitted_inspections'
    )
    capacity_occupied = models.PositiveIntegerField(null=True, blank=True)
    findings_json = models.JSONField(default=list)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('PENDING_REVIEW', 'Pending Supervisor Review'),
            ('APPROVED', 'Approved & Applied'),
            ('REJECTED', 'Rejected')
        ],
        default='PENDING_REVIEW'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_inspections'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Inspection on {self.shelter.code} by {self.inspector} ({self.status})"
