from django.db import models
from django.utils import timezone
from django.conf import settings
from core.models import TimeStampedUUIDModel
from incidents.models import Incident
from shelters.models import Shelter
from assistance.models import AssistanceRequest

class EvaluationStatus(models.TextChoices):
    FEASIBLE_WITH_AVAILABLE_DATA = 'FEASIBLE_WITH_AVAILABLE_DATA', 'Feasible with Available Data'
    UNSUITABLE = 'UNSUITABLE', 'Unsuitable (Known Hard Barrier Exists)'
    UNVERIFIED = 'UNVERIFIED', 'Unverified (Missing or Stale Information)'

class RouteCandidate(TimeStampedUUIDModel):
    """
    Candidate evacuation path connecting an incident origin to a designated shelter.
    """
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='routes')
    candidate_code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=150)
    origin_name = models.CharField(max_length=150)
    origin_latitude = models.FloatField()
    origin_longitude = models.FloatField()
    destination_shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name='candidate_routes')
    
    distance_km = models.FloatField(default=2.5)
    estimated_time_minutes = models.PositiveIntegerField(default=15)
    geometry_geojson = models.JSONField(
        default=dict,
        help_text="GeoJSON LineString containing coordinates [[lon, lat], ...]"
    )
    source = models.CharField(max_length=100, default='ODRF Geospatial Route Engine')
    observed_at = models.DateTimeField(default=timezone.now)

    def is_stale(self, threshold_minutes: int = 60) -> bool:
        if not self.observed_at:
            return True
        diff = timezone.now() - self.observed_at
        return diff.total_seconds() > (threshold_minutes * 60)

    def __str__(self):
        return f"{self.candidate_code}: {self.origin_name} -> {self.destination_shelter.name} ({self.distance_km}km)"

class RouteSegment(TimeStampedUUIDModel):
    """
    Sub-segment of a candidate route with specific ground conditions, flood levels, or physical barriers.
    """
    route = models.ForeignKey(RouteCandidate, on_delete=models.CASCADE, related_name='segments')
    segment_code = models.CharField(max_length=50)
    name = models.CharField(max_length=150)
    geometry_geojson = models.JSONField(default=dict)
    
    condition = models.CharField(
        max_length=30,
        choices=[
            ('CLEAR', 'Clear & Paved'),
            ('WATERLOGGED', 'Waterlogged'),
            ('DEBRIS_BLOCKED', 'Debris Blocked / Fallen Trees'),
            ('DAMAGED', 'Structural Damage'),
        ],
        default='CLEAR'
    )
    is_flooded = models.BooleanField(default=False)
    water_depth_cm = models.IntegerField(default=0)
    has_stairs_or_curbs = models.BooleanField(default=False)
    observed_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.route.candidate_code} - {self.segment_code}: {self.name} ({self.condition})"

class RouteEvaluation(TimeStampedUUIDModel):
    """
    Persisted evaluation record explaining why a route was found FEASIBLE, UNSUITABLE, or UNVERIFIED.
    """
    request = models.ForeignKey(AssistanceRequest, on_delete=models.CASCADE, related_name='route_evaluations')
    route = models.ForeignKey(RouteCandidate, on_delete=models.CASCADE, related_name='evaluations')
    status = models.CharField(
        max_length=40,
        choices=EvaluationStatus.choices,
        db_index=True
    )
    checks_json = models.JSONField(default=list)
    reasons_json = models.JSONField(default=list)
    rule_version = models.CharField(max_length=20, default='mvp-1.0')
    human_review_required = models.BooleanField(default=True)

    evaluated_at = models.DateTimeField(default=timezone.now)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_evaluations'
    )
    review_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Eval: Req {self.request.public_ref} -> {self.route.candidate_code} => {self.status}"
