import pytest
from rest_framework.test import APIClient
from accounts.models import User, UserRole
from shelters.models import Shelter
from audit.models import AuditEvent

@pytest.mark.django_db
def test_field_responder_cannot_verify_shelter():
    """
    Test that a field responder cannot call the verify shelter endpoint.
    Expected: HTTP 403 Forbidden.
    """
    client = APIClient()
    responder = User.objects.get(username="rajesh_responder")
    client.force_authenticate(user=responder)
    
    shelter = Shelter.objects.first()
    response = client.post(
        f"/api/v1/shelters/{shelter.id}/verify/",
        {"features": {"step_free_access": "YES"}},
        format='json'
    )
    
    assert response.status_code == 403

@pytest.mark.django_db
def test_coordinator_can_verify_shelter():
    """
    Test that a coordinator can verify shelter features.
    Expected: HTTP 200 OK.
    """
    client = APIClient()
    coordinator = User.objects.get(username="priya_coordinator")
    client.force_authenticate(user=coordinator)
    
    shelter = Shelter.objects.first()
    response = client.post(
        f"/api/v1/shelters/{shelter.id}/verify/",
        {
            "features": {"step_free_access": "YES"},
            "reason": "Supervisor on-site validation complete."
        },
        format='json'
    )
    
    assert response.status_code == 200
    assert response.data["shelter"]["review_status"] == "VERIFIED"

@pytest.mark.django_db
def test_audit_records_are_immutable():
    """
    Test that AuditEvent records cannot be modified or deleted.
    Expected: ValueError raised on save/delete.
    """
    audit = AuditEvent.objects.create(
        action="TEST_ACTION",
        entity_type="TestEntity",
        entity_id="123",
        reason="Initial entry"
    )
    
    with pytest.raises(ValueError, match="Audit records are immutable"):
        audit.reason = "Modified reason"
        audit.save()

    with pytest.raises(ValueError, match="Audit records are immutable"):
        audit.delete()
