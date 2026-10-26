from rest_framework import serializers
from .models import AuditEvent

class AuditEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditEvent
        fields = [
            'id', 'actor', 'actor_name', 'action', 'entity_type',
            'entity_id', 'reason', 'change_summary', 'client_ip', 'timestamp'
        ]
        read_only_fields = fields
