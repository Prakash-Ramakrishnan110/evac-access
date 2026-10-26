"""
Master API Router for EvacAccess India REST Endpoints (v1)
"""
from django.urls import path, include

urlpatterns = [
    path('auth/', include('accounts.urls')),
    path('incidents/', include('incidents.urls')),
    path('shelters/', include('shelters.urls')),
    path('assistance-requests/', include('assistance.urls')),
    path('routes/', include('routing.urls')),
    path('assignments/', include('assignments.urls')),
    path('alerts/', include('alerts.urls')),
    path('field-reports/', include('field_reports.urls')),
    path('audit-events/', include('audit.urls')),
]
