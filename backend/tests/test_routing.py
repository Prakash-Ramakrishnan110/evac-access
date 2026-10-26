import pytest
from datetime import timedelta
from django.utils import timezone
from routing.models import RouteCandidate, RouteSegment, EvaluationStatus
from routing.evaluator import RouteFeasibilityEvaluator
from assistance.models import AssistanceRequest
from shelters.models import Shelter, ShelterFeature, FeatureValue, OperatingStatus

@pytest.mark.django_db
def test_hard_barrier_destination_lacks_ramp():
    """
    Test Case 1: Wheelchair user evaluating a shelter that lacks step-free entrance.
    Expected: UNSUITABLE with explicit reason.
    """
    req = AssistanceRequest.objects.get(public_ref="EA-1001") # Requires wheelchair & step_free_access
    route = RouteCandidate.objects.get(candidate_code="ROUTE-DEMO-01") # Leads to SH-PURI-01 (no ramp)
    
    result = RouteFeasibilityEvaluator.evaluate(req, route)
    
    assert result["status"] == EvaluationStatus.UNSUITABLE
    assert any(check["result"] == "FAIL" for check in result["checks"])
    assert any("Destination shelter lacks mandatory feature" in reason for reason in result["reasons"])

@pytest.mark.django_db
def test_hard_barrier_flooded_route_segment():
    """
    Test Case 2: Wheelchair user evaluating a route where a segment has 35cm flood water.
    Expected: UNSUITABLE with segment flood detail.
    """
    req = AssistanceRequest.objects.get(public_ref="EA-1001")
    route = RouteCandidate.objects.get(candidate_code="ROUTE-DEMO-02") # Leads to SH-PURI-02 via flooded Marine Drive
    
    result = RouteFeasibilityEvaluator.evaluate(req, route)
    
    assert result["status"] == EvaluationStatus.UNSUITABLE
    assert any("flood_clearance" in check["requirement"] and check["result"] == "FAIL" for check in result["checks"])
    assert any("Segment 'Marine Drive Coastal Stretch' is flooded" in reason for reason in result["reasons"])

@pytest.mark.django_db
def test_stale_hazard_triggers_unverified():
    """
    Test Case 3: If route observations are older than threshold (60 min), result is UNVERIFIED.
    """
    req = AssistanceRequest.objects.get(public_ref="EA-1001")
    route = RouteCandidate.objects.get(candidate_code="ROUTE-DEMO-03")
    
    # Simulate stale observation
    route.observed_at = timezone.now() - timedelta(minutes=120)
    route.save()
    
    result = RouteFeasibilityEvaluator.evaluate(req, route)
    
    assert result["status"] == EvaluationStatus.UNVERIFIED
    assert any("route_observation_freshness" in check["requirement"] and check["result"] == "UNKNOWN" for check in result["checks"])

@pytest.mark.django_db
def test_feasible_match():
    """
    Test Case 4: Route 3 with fresh observation to verified shelter with ramp.
    Expected: FEASIBLE_WITH_AVAILABLE_DATA with human_review_required=True.
    """
    req = AssistanceRequest.objects.get(public_ref="EA-1001")
    route = RouteCandidate.objects.get(candidate_code="ROUTE-DEMO-03")
    
    # Ensure fresh observation
    route.observed_at = timezone.now()
    route.save()
    
    result = RouteFeasibilityEvaluator.evaluate(req, route)
    
    assert result["status"] == EvaluationStatus.FEASIBLE_WITH_AVAILABLE_DATA
    assert result["human_review_required"] is True
    assert len(result["reasons"]) > 0
