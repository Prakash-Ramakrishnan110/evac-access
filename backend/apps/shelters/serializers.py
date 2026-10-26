from rest_framework import serializers
from .models import Shelter, ShelterFeature, ShelterInspection

class ShelterFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelterFeature
        fields = [
            'id', 'feature_key', 'value', 'evidence_note',
            'evidence_ref', 'verified_by', 'verified_at'
        ]

class ShelterInspectionSerializer(serializers.ModelSerializer):
    inspector_name = serializers.ReadOnlyField(source='inspector.username')

    class Meta:
        model = ShelterInspection
        fields = [
            'id', 'shelter', 'inspector', 'inspector_name', 'capacity_occupied',
            'findings_json', 'notes', 'status', 'reviewed_by', 'reviewed_at', 'created_at'
        ]
        read_only_fields = ['id', 'inspector', 'status', 'reviewed_by', 'reviewed_at', 'created_at']

class ShelterSerializer(serializers.ModelSerializer):
    features = ShelterFeatureSerializer(many=True, read_only=True)
    available_capacity = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()

    class Meta:
        model = Shelter
        fields = [
            'id', 'incident', 'code', 'name', 'address', 'latitude', 'longitude',
            'capacity_total', 'capacity_occupied', 'available_capacity', 'is_full',
            'operating_status', 'review_status', 'last_verified_at', 'verified_by',
            'source', 'contact_person', 'contact_phone', 'notes', 'features',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
