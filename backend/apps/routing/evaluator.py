from typing import Dict, Any, List, Tuple
from django.conf import settings
from .models import RouteCandidate, RouteSegment, EvaluationStatus
from assistance.models import AssistanceRequest
from shelters.models import FeatureValue, OperatingStatus

RULE_VERSION = "mvp-1.0"

class RouteFeasibilityEvaluator:
    """
    Deterministic, explainable, and versioned evaluation engine for EvacAccess India.
    """

    @classmethod
    def evaluate(cls, request: AssistanceRequest, route: RouteCandidate) -> Dict[str, Any]:
        checks: List[Dict[str, Any]] = []
        reasons: List[str] = []
        status = EvaluationStatus.FEASIBLE_WITH_AVAILABLE_DATA
        shelter = route.destination_shelter
        freshness_limit = getattr(settings, 'HAZARD_FRESHNESS_THRESHOLD_MINUTES', 60)

        # ---------------------------------------------------------
        # Check 1: Route Observation Freshness
        # ---------------------------------------------------------
        if route.is_stale(freshness_limit):
            checks.append({
                "requirement": "route_observation_freshness",
                "result": "UNKNOWN",
                "source": route.source,
                "details": f"Route observation is older than {freshness_limit} minutes."
            })
            reasons.append(f"Route hazard observation is older than {freshness_limit} minutes and cannot be verified.")
            status = EvaluationStatus.UNVERIFIED
        else:
            checks.append({
                "requirement": "route_observation_freshness",
                "result": "PASS",
                "source": route.source,
                "details": "Route observation is within freshness window."
            })

        # ---------------------------------------------------------
        # Check 2: Physical Route Segment Barriers
        # ---------------------------------------------------------
        segments = RouteSegment.objects.filter(route=route)
        for seg in segments:
            # Check 2a: Flooding & Water Depth
            if seg.is_flooded:
                # Wheelchair users cannot cross flooded segments (> 10cm is hazardous)
                if request.is_wheelchair_required() and seg.water_depth_cm > 10:
                    checks.append({
                        "requirement": f"segment_{seg.segment_code}_flood_clearance",
                        "result": "FAIL",
                        "source": f"Segment {seg.name}",
                        "details": f"Water depth is {seg.water_depth_cm}cm (threshold: 10cm for wheelchair users)."
                    })
                    reasons.append(f"Hard Barrier: Segment '{seg.name}' is flooded with {seg.water_depth_cm}cm water, impassable for wheelchairs.")
                    return {
                        "route_id": route.candidate_code,
                        "status": EvaluationStatus.UNSUITABLE,
                        "checks": checks,
                        "reasons": reasons,
                        "rule_version": RULE_VERSION,
                        "human_review_required": True
                    }
                elif seg.water_depth_cm > 40:
                    # Impassable for ordinary light rescue vehicles
                    checks.append({
                        "requirement": f"segment_{seg.segment_code}_flood_clearance",
                        "result": "FAIL",
                        "source": f"Segment {seg.name}",
                        "details": f"Water depth is {seg.water_depth_cm}cm (threshold: 40cm for standard vehicles)."
                    })
                    reasons.append(f"Hard Barrier: Segment '{seg.name}' is deeply submerged ({seg.water_depth_cm}cm).")
                    return {
                        "route_id": route.candidate_code,
                        "status": EvaluationStatus.UNSUITABLE,
                        "checks": checks,
                        "reasons": reasons,
                        "rule_version": RULE_VERSION,
                        "human_review_required": True
                    }

            # Check 2b: Stairs & High Curbs for Wheelchair / Mobility Impaired
            if (request.is_wheelchair_required() or request.is_step_free_required()) and seg.has_stairs_or_curbs:
                checks.append({
                    "requirement": f"segment_{seg.segment_code}_step_free",
                    "result": "FAIL",
                    "source": f"Segment {seg.name}",
                    "details": "Segment contains unramped curbs or steps."
                })
                reasons.append(f"Hard Barrier: Segment '{seg.name}' has unramped steps or curbs conflicting with mobility requirements.")
                return {
                    "route_id": route.candidate_code,
                    "status": EvaluationStatus.UNSUITABLE,
                    "checks": checks,
                    "reasons": reasons,
                    "rule_version": RULE_VERSION,
                    "human_review_required": True
                }

        # ---------------------------------------------------------
        # Check 3: Shelter Operating Status & Capacity
        # ---------------------------------------------------------
        if shelter.operating_status == OperatingStatus.CLOSED:
            checks.append({
                "requirement": "shelter_operating_status",
                "result": "FAIL",
                "source": shelter.source,
                "details": "Shelter is currently closed or inundated."
            })
            reasons.append(f"Destination shelter '{shelter.name}' is closed.")
            return {
                "route_id": route.candidate_code,
                "status": EvaluationStatus.UNSUITABLE,
                "checks": checks,
                "reasons": reasons,
                "rule_version": RULE_VERSION,
                "human_review_required": True
            }

        if shelter.is_full:
            checks.append({
                "requirement": "shelter_capacity",
                "result": "FAIL",
                "source": shelter.source,
                "details": f"Shelter is at full capacity ({shelter.capacity_occupied}/{shelter.capacity_total})."
            })
            reasons.append(f"Destination shelter '{shelter.name}' has no available capacity.")
            return {
                "route_id": route.candidate_code,
                "status": EvaluationStatus.UNSUITABLE,
                "checks": checks,
                "reasons": reasons,
                "rule_version": RULE_VERSION,
                "human_review_required": True
            }

        # ---------------------------------------------------------
        # Check 4: Shelter Accessibility Features Match
        # ---------------------------------------------------------
        # Map request requirements to shelter feature keys
        req_mapping = {
            'wheelchair': ['step_free_access', 'wheelchair_ramp', 'accessible_restroom'],
            'step_free_access': ['step_free_access'],
            'oxygen_electricity': ['backup_power_for_oxygen'],
            'visual_assistance': ['tactile_paving', 'braille_signage'],
            'auditory_assistance': ['sign_language_support'],
        }

        features_to_check = set()
        for r in request.requirements_list:
            if r in req_mapping:
                features_to_check.update(req_mapping[r])
            else:
                features_to_check.add(r)

        for feat_key in sorted(features_to_check):
            feat_val = shelter.get_feature_value(feat_key)
            if feat_val == FeatureValue.NO:
                checks.append({
                    "requirement": feat_key,
                    "result": "FAIL",
                    "source": shelter.source,
                    "details": f"Shelter confirmed to lack required feature '{feat_key}'."
                })
                reasons.append(f"Hard Barrier: Destination shelter lacks mandatory feature '{feat_key}'.")
                return {
                    "route_id": route.candidate_code,
                    "status": EvaluationStatus.UNSUITABLE,
                    "checks": checks,
                    "reasons": reasons,
                    "rule_version": RULE_VERSION,
                    "human_review_required": True
                }
            elif feat_val == FeatureValue.UNKNOWN:
                checks.append({
                    "requirement": feat_key,
                    "result": "UNKNOWN",
                    "source": shelter.source,
                    "details": f"Feature '{feat_key}' has not been inspected or verified."
                })
                reasons.append(f"Status of mandatory feature '{feat_key}' at shelter is UNKNOWN.")
                status = EvaluationStatus.UNVERIFIED
            else:
                checks.append({
                    "requirement": feat_key,
                    "result": "PASS",
                    "source": shelter.source,
                    "details": f"Feature '{feat_key}' verified available."
                })

        # Check 5: Shelter Verification Freshness
        if not shelter.last_verified_at:
            checks.append({
                "requirement": "shelter_verification_recency",
                "result": "UNKNOWN",
                "source": shelter.source,
                "details": "Shelter has never been verified by a qualified inspector."
            })
            reasons.append(f"Shelter '{shelter.name}' has no formal verification record.")
            status = EvaluationStatus.UNVERIFIED

        if status == EvaluationStatus.FEASIBLE_WITH_AVAILABLE_DATA:
            reasons.append("All mandatory accessibility requirements and route segment clearances are verified with fresh data.")

        return {
            "route_id": route.candidate_code,
            "status": status,
            "checks": checks,
            "reasons": reasons,
            "rule_version": RULE_VERSION,
            "human_review_required": True
        }
