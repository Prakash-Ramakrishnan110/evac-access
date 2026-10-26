import uuid
from django.db import models
from django.conf import settings

class AuditEvent(models.Model):
    """
    Append-only audit trail capturing safety-critical decisions, verifications,
    and dispatch state changes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_events'
    )
    actor_name = models.CharField(max_length=150, blank=True)
    action = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=100, db_index=True)
    entity_id = models.CharField(max_length=100, db_index=True)
    reason = models.TextField(blank=True)
    change_summary = models.JSONField(default=dict, blank=True)
    client_ip = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def save(self, *args, **kwargs):
        # Enforce append-only semantics: prevent updates to existing records
        if self.pk and AuditEvent.objects.filter(pk=self.pk).exists():
            raise ValueError("Audit records are immutable and cannot be modified.")
        if self.actor and not self.actor_name:
            self.actor_name = self.actor.username
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Audit records are immutable and cannot be deleted.")

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.actor_name} -> {self.action} ({self.entity_type} {self.entity_id})"
