from rest_framework.routers import DefaultRouter
from .views import FieldReportViewSet

router = DefaultRouter()
router.register(r'', FieldReportViewSet, basename='field-report')

urlpatterns = router.urls
