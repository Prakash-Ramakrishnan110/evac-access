from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RouteCandidate, RouteEvaluation
from .serializers import RouteCandidateSerializer, RouteEvaluationSerializer
from .evaluator import RouteFeasibilityEvaluator
from assistance.models import AssistanceRequest
from audit.logger import log_audit_event

class RouteCandidateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List and retrieve candidate evacuation routes.
    """
    queryset = RouteCandidate.objects.all().order_by('candidate_code')
    serializer_class = RouteCandidateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['incident', 'destination_shelter']

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def evaluate(self, request):
        """
        Evaluate candidate route against an assistance request.
        Payload: {"request_id": "<UUID>", "route_id": "<UUID>"}
        """
        request_id = request.data.get('request_id')
        route_id = request.data.get('route_id')

        if not request_id or not route_id:
            return Response(
                {"detail": "Both 'request_id' and 'route_id' are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            req_obj = AssistanceRequest.objects.get(id=request_id)
        except AssistanceRequest.DoesNotExist:
            return Response({"detail": f"AssistanceRequest with id {request_id} not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            route_obj = RouteCandidate.objects.get(id=route_id)
        except RouteCandidate.DoesNotExist:
            return Response({"detail": f"RouteCandidate with id {route_id} not found."}, status=status.HTTP_404_NOT_FOUND)

        eval_output = RouteFeasibilityEvaluator.evaluate(req_obj, route_obj)

        # Persist evaluation record
        evaluation_record = RouteEvaluation.objects.create(
            request=req_obj,
            route=route_obj,
            status=eval_output['status'],
            checks_json=eval_output['checks'],
            reasons_json=eval_output['reasons'],
            rule_version=eval_output['rule_version'],
            human_review_required=eval_output['human_review_required']
        )

        log_audit_event(
            actor=request.user,
            action="EVALUATE_ROUTE_FEASIBILITY",
            entity_type="RouteCandidate",
            entity_id=route_obj.candidate_code,
            reason=f"Feasibility outcome: {eval_output['status']} for request {req_obj.public_ref}.",
            change_summary={
                "request_ref": req_obj.public_ref,
                "status": eval_output['status'],
                "reasons": eval_output['reasons']
            }
        )

        response_data = eval_output.copy()
        response_data['evaluation_id'] = str(evaluation_record.id)
        return Response(response_data, status=status.HTTP_200_OK)

class RouteEvaluationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List past evaluations and audit history.
    """
    queryset = RouteEvaluation.objects.all().order_by('-evaluated_at')
    serializer_class = RouteEvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['request', 'route', 'status']
