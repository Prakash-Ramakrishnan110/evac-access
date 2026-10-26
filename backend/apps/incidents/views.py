from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Incident, HazardZone
from .serializers import IncidentSerializer, HazardZoneSerializer
from accounts.permissions import IsCoordinatorOrAbove

class IncidentViewSet(viewsets.ModelViewSet):
    """
    CRUD for Incidents and GIS aggregate map layer retrieval.
    """
    queryset = Incident.objects.all().order_by('-created_at')
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCoordinatorOrAbove()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['get'])
    def map(self, request, pk=None):
        """
        Aggregate GeoJSON endpoint for Leaflet/MapLibre GIS Tactical View.
        Returns shelters, active requests, hazard polygons, and obstacles.
        """
        incident = self.get_object()

        # Build combined response
        from shelters.serializers import ShelterSerializer
        from assistance.serializers import AssistanceRequestSerializer
        from routing.models import RouteCandidate
        from routing.serializers import RouteCandidateSerializer
        from field_reports.models import FieldReport
        from field_reports.serializers import FieldReportSerializer

        shelters = incident.shelters.all()
        requests = incident.assistance_requests.all()
        routes = RouteCandidate.objects.filter(incident=incident)
        reports = FieldReport.objects.filter(incident=incident, status='ACCEPTED')

        return Response({
            "incident": IncidentSerializer(incident).data,
            "hazard_zones": HazardZoneSerializer(incident.hazard_zones.all(), many=True).data,
            "shelters": ShelterSerializer(shelters, many=True).data,
            "assistance_requests": AssistanceRequestSerializer(requests, many=True).data,
            "route_candidates": RouteCandidateSerializer(routes, many=True).data,
            "field_reports": FieldReportSerializer(reports, many=True).data,
        })
