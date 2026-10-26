from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.ReadOnlyField(source='approved_by.username')

    class Meta:
        model = Alert
        fields = [
            'id', 'incident', 'title', 'target_zone', 'message_en',
            'message_hi', 'message_or', 'preferred_format', 'status',
            'is_simulated_preview', 'approved_by', 'approved_by_name',
            'approved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_simulated_preview', 'approved_at', 'created_at', 'updated_at']
