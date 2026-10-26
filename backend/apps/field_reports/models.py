from django.db import models
from django.utils import timezone
from django.conf import settings
from core.models import TimeStampedUUIDModel
from incidents.models import Incident

class ReportType(models.TextChoices):
    OBSTACLE = 'OBSTACLE', 'Road Obstacle / Fallen Tree / Debris'
    HAZARD_INUNDATION = 'HAZARD_INUNDATION', 'Waterlogging / Rising Flood'
    SHELTER_UPDATE = 'SHELTER_UPDATE', 'Shelter Condition Update'
    GENERAL_OBSERVATION = 'GENERAL_OBSERVATION', 'General Field Observation'

class ReportStatus(models.TextChoices):
    PENDING_REVIEW = 'PENDING_REVIEW', 'Pending Supervisor Verification'
    ACCEPTED = 'ACCEPTED', 'Accepted & Published to Map'
    REJECTED = 'REJECTED', 'Rejected / Duplicate / False Alarm'
    CONFLICT = 'CONFLICT', 'Conflict with Existing Record'

class FieldReport(TimeStampedUUIDModel):
    """
    Field observation submitted by mobile responder or verified volunteer.
    Supports offline sync with client idempotency key to prevent double submissions.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='field_reports')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='submitted_reports'
    )
    report_type = models.CharField(
        max_length=30,
        choices=ReportType.choices,
        default=ReportType.OBSTACLE,
        db_index=True
    )
    title = models.CharField(max_length=150)
    note = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    photo_url = models.CharField(max_length=500, blank=True)
    
    observed_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=25,
        choices=ReportStatus.choices,
        default=ReportStatus.PENDING_REVIEW,
        db_index=True
    )
    idempotency_key = models.CharField(max_length=100, unique=True, null=True, blank=True, db_index=True)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_field_reports'
    )
    review_notes = models.TextField(blank=True)

    def __str__(self):
        return f"[{self.get_report_type_display()}] {self.title} by {self.author} ({self.status})"
