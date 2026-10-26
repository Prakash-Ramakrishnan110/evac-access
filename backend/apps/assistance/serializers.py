from rest_framework import serializers
from .models import AssistanceRequest

class AssistanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'incident', 'public_ref', 'urgency', 'status',
            'requirements', 'number_of_people', 'approximate_address',
            'latitude', 'longitude', 'contact_phone_masked',
            'consent_recorded', 'operational_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
