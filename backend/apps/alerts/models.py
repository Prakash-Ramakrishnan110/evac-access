from django.db import models
from django.utils import timezone
from django.conf import settings
from core.models import TimeStampedUUIDModel
from incidents.models import Incident

class AlertStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft Notice'
    PREVIEWED = 'PREVIEWED', 'Preview Mode (Unsent)'
    APPROVED = 'APPROVED', 'Approved for Dispatch'
    DELIVERED = 'DELIVERED', 'Delivered to Public Gateways'
    DELIVERY_UNKNOWN = 'DELIVERY_UNKNOWN', 'Delivery State Unknown'

class AlertFormat(models.TextChoices):
    HIGH_CONTRAST_LARGE_TEXT = 'LARGE_TEXT', 'High-Contrast Large Text (WCAG AAA)'
    AUDIO_TTS = 'AUDIO_TTS', 'Synthesized Audio Speech'
    BILINGUAL_SMS = 'BILINGUAL_SMS', 'Bilingual SMS (Odia + English)'

class Alert(TimeStampedUUIDModel):
    """
    Emergency public alert draft with accessibility-focused multi-modal rendering.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='alerts')
    title = models.CharField(max_length=150)
    target_zone = models.CharField(max_length=150, default='All Sectors in Incident Perimeter')
    
    # Multilingual content
    message_en = models.TextField(help_text="Standard English text")
    message_hi = models.TextField(blank=True, help_text="Hindi text for accessible broadcast")
    message_or = models.TextField(blank=True, help_text="Odia text for local Odisha broadcast")
    
    preferred_format = models.CharField(
        max_length=30,
        choices=AlertFormat.choices,
        default=AlertFormat.HIGH_CONTRAST_LARGE_TEXT
    )
    status = models.CharField(
        max_length=25,
        choices=AlertStatus.choices,
        default=AlertStatus.PREVIEWED,
        db_index=True
    )
    is_simulated_preview = models.BooleanField(default=True)
    
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_alerts'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} [{self.get_status_display()}] - {self.target_zone}"
