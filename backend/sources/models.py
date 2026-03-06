import uuid
from django.conf import settings
from django.db import models


class Source(models.Model):
    """Source médiatique vérifiable associée à un lien d'influence."""

    TYPE_MEDIA_CHOICES = [
        ('presse_ecrite', 'Presse écrite'),
        ('television', 'Télévision'),
        ('radio', 'Radio'),
        ('web', 'Web'),
        ('document_officiel', 'Document officiel'),
        ('rapport', 'Rapport / Étude'),
        ('video', 'Vidéo'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    url = models.URLField(max_length=1024)
    titre = models.TextField()
    media = models.CharField(max_length=255, blank=True, help_text="Ex: Le Monde, BBC, Reuters")
    type_media = models.CharField(max_length=100, choices=TYPE_MEDIA_CHOICES, blank=True)
    langue = models.CharField(max_length=10, default='fr')
    pays_media = models.CharField(max_length=100, blank=True)
    date_publication = models.DateField(null=True, blank=True)
    date_consultation = models.DateField(null=True, blank=True)
    auteur = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    verifiee = models.BooleanField(default=False)
    verifiee_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sources_verifiees'
    )
    verifiee_le = models.DateTimeField(null=True, blank=True)

    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='sources_creees'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sources'
        verbose_name = 'Source'
        verbose_name_plural = 'Sources'
        ordering = ['-date_publication']

    def __str__(self):
        return f"{self.titre} ({self.media})"
