from rest_framework import serializers
from .models import RouteCandidate, RouteSegment, RouteEvaluation
from shelters.serializers import ShelterSerializer

class RouteSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteSegment
        fields = [
            'id', 'segment_code', 'name', 'geometry_geojson', 'condition',
            'is_flooded', 'water_depth_cm', 'has_stairs_or_curbs', 'observed_at'
        ]

class RouteCandidateSerializer(serializers.ModelSerializer):
    segments = RouteSegmentSerializer(many=True, read_only=True)
    destination_shelter_detail = ShelterSerializer(source='destination_shelter', read_only=True)
    is_stale = serializers.SerializerMethodField()

    class Meta:
        model = RouteCandidate
        fields = [
            'id', 'incident', 'candidate_code', 'title', 'origin_name',
            'origin_latitude', 'origin_longitude', 'destination_shelter',
            'destination_shelter_detail', 'distance_km', 'estimated_time_minutes',
            'geometry_geojson', 'source', 'observed_at', 'is_stale', 'segments'
        ]

    def get_is_stale(self, obj) -> bool:
        return obj.is_stale()

class RouteEvaluationSerializer(serializers.ModelSerializer):
    route_candidate_code = serializers.ReadOnlyField(source='route.candidate_code')
    request_public_ref = serializers.ReadOnlyField(source='request.public_ref')

    class Meta:
        model = RouteEvaluation
        fields = [
            'id', 'request', 'request_public_ref', 'route', 'route_candidate_code',
            'status', 'checks_json', 'reasons_json', 'rule_version',
            'human_review_required', 'evaluated_at', 'reviewed_by', 'review_notes'
        ]
        read_only_fields = ['id', 'evaluated_at']
