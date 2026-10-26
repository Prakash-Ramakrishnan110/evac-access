from django.db import models
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from core.models import TimeStampedUUIDModel
from assistance.models import AssistanceRequest

class AssignmentStatus(models.TextChoices):
    UNASSIGNED = 'UNASSIGNED', 'Unassigned'
    ASSIGNED = 'ASSIGNED', 'Assigned - Pending Acknowledgement'
    ACKNOWLEDGED = 'ACKNOWLEDGED', 'Acknowledged by Responder'
    EN_ROUTE = 'EN_ROUTE', 'Team En Route to Victim'
    COMPLETED = 'COMPLETED', 'Mission Completed / Evacuee at Shelter'
    ESCALATED = 'ESCALATED', 'Escalated / Rescue Obstructed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class Assignment(TimeStampedUUIDModel):
    """
    Emergency dispatch record matching a responder team to an assistance request.
    """
    request = models.OneToOneField(AssistanceRequest, on_delete=models.CASCADE, related_name='assignment')
    team_name = models.CharField(max_length=150, default='ODRF Team Alpha')
    assigned_responder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='field_assignments'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='authorized_dispatches'
    )
    status = models.CharField(
        max_length=25,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.ASSIGNED,
        db_index=True
    )
    acknowledgement_deadline = models.DateTimeField(null=True, blank=True)
    assigned_at = models.DateTimeField(default=timezone.now)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.acknowledgement_deadline:
            self.acknowledgement_deadline = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Dispatch: {self.team_name} -> {self.request.public_ref} [{self.get_status_display()}]"
