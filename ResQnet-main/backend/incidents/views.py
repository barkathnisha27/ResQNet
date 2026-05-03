from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
import logging

from .models import Incident
from .serializers import IncidentSerializer
from users.models import User
from users.permissions import IsCitizen

from ml_engine.inference import run_disaster_model

LOG = logging.getLogger(__name__)


class CreateIncident(APIView):
    """
    Endpoint to create a new incident report.
    
    Only authenticated citizens can create incidents.
    
    Required fields:
    - disaster_type
    - severity
    - people_affected
    - latitude
    - longitude
    - description
    
    Returns:
    - Created incident with priority score
    - Auto-assigned NGO
    """
    permission_classes = [IsCitizen]

    def post(self, request):
        """Create incident and assign to NGO."""
        serializer = IncidentSerializer(data=request.data)
        if serializer.is_valid():
            incident = serializer.save(reported_by=request.user)

            # prepare features and run ML inference
            features = {
                "severity": incident.severity,
                "people_affected": incident.people_affected,
                "latitude": incident.latitude,
                "longitude": incident.longitude,
            }
            result = run_disaster_model(incident.disaster_type, features)
            risk_score = result.get("risk_score", 0.0)
            confidence = result.get("confidence", 0.0)

            # compute final priority using the model output
            incident.priority_score = incident.calculate_priority(risk_score)

            # Auto-assign NGO: choose ngo with fewest assigned incidents
            ngos = (
                User.objects.filter(role="ngo")
                .annotate(num=Count("assigned_incidents"))
                .order_by("num")
            )
            if ngos.exists():
                incident.assigned_ngo = ngos.first()

            incident.save()

            response = {
                "success": True,
                "message": "Incident created successfully",
                "incident": {
                    "id": incident.id,
                    "priority_score": incident.priority_score,
                    "risk_score": risk_score,
                    "model_used": incident.disaster_type,
                    "assigned_ngo": incident.assigned_ngo.username if incident.assigned_ngo else None,
                }
            }
            return Response(response, status=status.HTTP_201_CREATED)
        
        return Response(
            {
                'success': False,
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )