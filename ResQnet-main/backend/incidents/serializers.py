from rest_framework import serializers
from .models import Incident

class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'
        read_only_fields = [
            'priority_score',
            'status',
            'assigned_ngo',
            'reported_by',  # will be set by view
        ]
