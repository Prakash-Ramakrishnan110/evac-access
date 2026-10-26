from django.db import models
from django.utils import timezone
from django.conf import settings
from core.models import TimeStampedUUIDModel

class IncidentScenario(models.TextChoices):
    FLOOD = 'FLOOD', 'Monsoon Riverine / Coastal Flooding'
    CYCLONE = 'CYCLONE', 'Severe Cyclonic Storm'
    EARTHQUAKE = 'EARTHQUAKE', 'Earthquake'
    TSUNAMI = 'TSUNAMI', 'Coastal Tsunami'
    URBAN_WATERLOGGING = 'URBAN_WATERLOGGING', 'Urban Waterlogging'

class IncidentStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft Planning'
    ACTIVE_DEMO = 'ACTIVE_DEMO', 'Active Simulation / Demo'
    ACTIVE_LIVE = 'ACTIVE_LIVE', 'Active Operational Incident'
    PAUSED = 'PAUSED', 'Paused'
    CLOSED = 'CLOSED', 'Incident Closed / De-escalated'

class Incident(TimeStampedUUIDModel):
    """
    Emergency incident representing an active crisis scenario.
    """
    code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    scenario_type = models.CharField(
        max_length=30,
        choices=IncidentScenario.choices,
        default=IncidentScenario.FLOOD
    )
    status = models.CharField(
        max_length=20,
        choices=IncidentStatus.choices,
        default=IncidentStatus.ACTIVE_DEMO,
        db_index=True
    )
    center_latitude = models.FloatField(default=19.8135)
    center_longitude = models.FloatField(default=85.8312)
    default_zoom = models.IntegerField(default=13)
    affected_area_geojson = models.JSONField(default=dict, blank=True)
    
    hazard_source = models.CharField(max_length=150, default='OSDMA / IMD Radar Simulation')
    hazard_observed_at = models.DateTimeField(default=timezone.now)
    is_demo_data = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_incidents'
    )

    def is_hazard_stale(self, threshold_minutes: int = 60) -> bool:
        """Checks if the incident hazard observations exceed freshness threshold."""
        if not self.hazard_observed_at:
            return True
        diff = timezone.now() - self.hazard_observed_at
        return diff.total_seconds() > (threshold_minutes * 60)

    def __str__(self):
        return f"{self.code} - {self.title} ({self.get_status_display()})"

class HazardZone(TimeStampedUUIDModel):
    """
    Simulated or monitored hazard polygons (e.g. flooded lowlands, water depth).
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='hazard_zones')
    zone_name = models.CharField(max_length=100)
    severity = models.CharField(
        max_length=20,
        choices=[
            ('EXTREME', 'Extreme Danger'),
            ('HIGH', 'High Flood Hazard'),
            ('MODERATE', 'Moderate Waterlogging'),
            ('LOW', 'Low Risk Advisory')
        ],
        default='HIGH'
    )
    water_depth_cm = models.IntegerField(default=30)
    geometry_geojson = models.JSONField(default=dict)
    observed_at = models.DateTimeField(default=timezone.now)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.zone_name} [{self.severity}] - {self.water_depth_cm}cm"
