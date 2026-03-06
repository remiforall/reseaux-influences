import uuid
from django.conf import settings
from django.db import models


class Personne(models.Model):
    """Personne publique référencée dans les réseaux d'influence."""

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('valide', 'Validé'),
        ('rejete', 'Rejeté'),
        ('archive', 'Archivé'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255, blank=True)
    pays = models.CharField(max_length=100, blank=True)
    nationalite = models.CharField(max_length=100, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    role_principal = models.CharField(max_length=255, blank=True, help_text="Ex: politique, journaliste, chef d'entreprise")
    bio = models.TextField(blank=True)
    photo_url = models.URLField(max_length=512, blank=True)
    wikipedia_url = models.URLField(max_length=512, blank=True)
    wikidata_id = models.CharField(max_length=50, blank=True)

    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='personnes_creees'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'personnes'
        verbose_name = 'Personne'
        verbose_name_plural = 'Personnes'
        ordering = ['nom', 'prenom']

    def __str__(self):
        if self.prenom:
            return f"{self.prenom} {self.nom}"
        return self.nom

    @property
    def nom_complet(self):
        if self.prenom:
            return f"{self.prenom} {self.nom}"
        return self.nom
