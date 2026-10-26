from rest_framework import serializers
from .models import FieldReport

class FieldReportSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.username')
    reviewed_by_name = serializers.ReadOnlyField(source='reviewed_by.username')

    class Meta:
        model = FieldReport
        fields = [
            'id', 'incident', 'author', 'author_name', 'report_type',
            'title', 'note', 'latitude', 'longitude', 'photo_url',
            'observed_at', 'status', 'idempotency_key', 'reviewed_by',
            'reviewed_by_name', 'review_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
