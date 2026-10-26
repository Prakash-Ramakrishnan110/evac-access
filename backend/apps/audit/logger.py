from typing import Optional, Dict, Any
from .models import AuditEvent

def log_audit_event(
    actor,
    action: str,
    entity_type: str,
    entity_id: str,
    reason: str = "",
    change_summary: Optional[Dict[str, Any]] = None,
    client_ip: Optional[str] = None
) -> AuditEvent:
    """
    Helper function to record an immutable audit event.
    """
    actor_obj = actor if (actor and getattr(actor, 'is_authenticated', False)) else None
    actor_name = actor.username if actor_obj else "SYSTEM"

    return AuditEvent.objects.create(
        actor=actor_obj,
        actor_name=actor_name,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        reason=reason,
        change_summary=change_summary or {},
        client_ip=client_ip
    )
