from rest_framework.routers import DefaultRouter
from .views import ShelterViewSet

router = DefaultRouter()
router.register(r'', ShelterViewSet, basename='shelter')

urlpatterns = router.urls
