from django.db import models
from core.models import TimeStampedUUIDModel
from incidents.models import Incident

class UrgencyLevel(models.TextChoices):
    CRITICAL_LIFE_THREAT = 'CRITICAL', 'Critical / Imminent Threat to Life'
    HIGH_PRIORITY = 'HIGH', 'High Priority / Vulnerable Individual'
    MEDIUM_PRIORITY = 'MEDIUM', 'Medium Priority'
    STANDARD = 'STANDARD', 'Standard Evacuation Assistance'

class RequestStatus(models.TextChoices):
    NEW = 'NEW', 'New Intake'
    TRIAGED = 'TRIAGED', 'Triaged / Reviewed'
    ASSIGNED = 'ASSIGNED', 'Assigned to Response Team'
    IN_PROGRESS = 'IN_PROGRESS', 'Rescue Team En Route'
    EVACUATED = 'EVACUATED', 'Safely Evacuated to Shelter'
    UNABLE_TO_CONTACT = 'UNABLE_TO_CONTACT', 'Unable to Contact'
    CANCELLED = 'CANCELLED', 'Cancelled'

class AssistanceRequest(TimeStampedUUIDModel):
    """
    Emergency assistance request submitted for vulnerable citizens needing specialized evacuation.
    Personal data is minimized to public reference IDs for general operational safety.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='assistance_requests')
    public_ref = models.CharField(max_length=50, unique=True, db_index=True)
    urgency = models.CharField(
        max_length=20,
        choices=UrgencyLevel.choices,
        default=UrgencyLevel.HIGH_PRIORITY,
        db_index=True
    )
    status = models.CharField(
        max_length=25,
        choices=RequestStatus.choices,
        default=RequestStatus.NEW,
        db_index=True
    )
    requirements = models.JSONField(
        default=list,
        help_text="List of accessibility requirement codes, e.g. ['wheelchair', 'step_free_access', 'oxygen_electricity']"
    )
    number_of_people = models.PositiveIntegerField(default=1)
    approximate_address = models.CharField(max_length=250)
    latitude = models.FloatField()
    longitude = models.FloatField()

    contact_phone_masked = models.CharField(max_length=20, default='XXXXXX-7890')
    consent_recorded = models.BooleanField(default=True)
    operational_notes = models.TextField(blank=True)

    @property
    def requirements_list(self) -> list:
        if isinstance(self.requirements, list):
            return self.requirements
        return []

    def is_wheelchair_required(self) -> bool:
        return 'wheelchair' in self.requirements_list

    def is_step_free_required(self) -> bool:
        return 'step_free_access' in self.requirements_list or 'wheelchair' in self.requirements_list

    def is_oxygen_required(self) -> bool:
        return 'oxygen_electricity' in self.requirements_list

    def __str__(self):
        return f"{self.public_ref} [{self.urgency}] - {self.status} ({len(self.requirements_list)} needs)"
