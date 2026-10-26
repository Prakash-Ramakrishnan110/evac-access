from rest_framework import serializers
from .models import Incident, HazardZone

class HazardZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = HazardZone
        fields = [
            'id', 'incident', 'zone_name', 'severity', 'water_depth_cm',
            'geometry_geojson', 'observed_at', 'notes'
        ]

class IncidentSerializer(serializers.ModelSerializer):
    hazard_zones = HazardZoneSerializer(many=True, read_only=True)
    is_hazard_stale = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = [
            'id', 'code', 'title', 'description', 'scenario_type',
            'status', 'center_latitude', 'center_longitude', 'default_zoom',
            'affected_area_geojson', 'hazard_source', 'hazard_observed_at',
            'is_demo_data', 'created_by', 'created_at', 'updated_at',
            'hazard_zones', 'is_hazard_stale'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_hazard_stale(self, obj) -> bool:
        return obj.is_hazard_stale()
