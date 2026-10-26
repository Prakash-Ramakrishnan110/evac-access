from rest_framework.routers import DefaultRouter
from .views import RouteCandidateViewSet, RouteEvaluationViewSet

router = DefaultRouter()
router.register(r'candidates', RouteCandidateViewSet, basename='route-candidate')
router.register(r'evaluations', RouteEvaluationViewSet, basename='route-evaluation')

urlpatterns = router.urls
