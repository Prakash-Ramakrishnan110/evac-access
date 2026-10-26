import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrator'
    COORDINATOR = 'COORDINATOR', 'Incident Coordinator'
    REVIEWER = 'REVIEWER', 'Reviewer / Supervisor'
    RESPONDER = 'RESPONDER', 'Field Responder / Volunteer'
    DEMO_VIEWER = 'DEMO_VIEWER', 'Demo Viewer'

class User(AbstractUser):
    """
    Custom user model with explicit emergency management roles and organizational affiliation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.DEMO_VIEWER,
        db_index=True
    )
    organization = models.CharField(max_length=150, blank=True, default='ODRF Disaster Cell')
    badge_number = models.CharField(max_length=50, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_admin_role(self) -> bool:
        return self.role == UserRole.ADMIN or self.is_superuser

    def is_coordinator_or_above(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.COORDINATOR] or self.is_superuser

    def is_reviewer_or_above(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.REVIEWER] or self.is_superuser

    def is_field_responder(self) -> bool:
        return self.role == UserRole.RESPONDER

    def __str__(self):
        return f"{self.username} ({self.get_role_display()}) - {self.organization}"
