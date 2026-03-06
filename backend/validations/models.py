import uuid
from django.conf import settings
from django.db import models


class Validation(models.Model):
    """Validation communautaire d'un lien d'influence."""

    VERDICT_CHOICES = [
        ('vrai', 'Vrai'),
        ('faux', 'Faux'),
        ('indecis', 'Indécis'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='validations'
    )
    lien = models.ForeignKey(
        'liens.Lien', on_delete=models.CASCADE, related_name='validations'
    )
    verdict = models.CharField(max_length=10, choices=VERDICT_CHOICES)
    commentaire = models.TextField(blank=True)
    source_supplementaire = models.URLField(max_length=1024, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'validations'
        unique_together = ('utilisateur', 'lien')
        verbose_name = 'Validation'
        verbose_name_plural = 'Validations'

    def __str__(self):
        return f"{self.utilisateur} → {self.lien} : {self.verdict}"
