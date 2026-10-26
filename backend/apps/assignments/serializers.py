from rest_framework import serializers
from .models import Assignment
from assistance.serializers import AssistanceRequestSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    request_detail = AssistanceRequestSerializer(source='request', read_only=True)
    assigned_responder_name = serializers.ReadOnlyField(source='assigned_responder.username')
    assigned_by_name = serializers.ReadOnlyField(source='assigned_by.username')

    class Meta:
        model = Assignment
        fields = [
            'id', 'request', 'request_detail', 'team_name', 'assigned_responder',
            'assigned_responder_name', 'assigned_by', 'assigned_by_name',
            'status', 'acknowledgement_deadline', 'assigned_at', 'acknowledged_at',
            'completed_at', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'assigned_at', 'created_at', 'updated_at']
