import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class TypeLien(models.Model):
    """Type de lien d'influence (référentiel)."""

    code = models.CharField(max_length=50, unique=True)
    libelle = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    categorie = models.CharField(max_length=100, blank=True)
    icone = models.CharField(max_length=50, blank=True)
    couleur = models.CharField(max_length=7, blank=True, help_text="Code couleur hex, ex: #FF5733")

    class Meta:
        db_table = 'types_liens'
        verbose_name = 'Type de lien'
        verbose_name_plural = 'Types de liens'

    def __str__(self):
        return self.libelle


class Lien(models.Model):
    """Lien d'influence entre deux personnes publiques."""

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('valide', 'Validé'),
        ('rejete', 'Rejeté'),
        ('archive', 'Archivé'),
        ('conteste', 'Contesté'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    personne_a = models.ForeignKey(
        'personnes.Personne', on_delete=models.CASCADE, related_name='liens_sortants'
    )
    personne_b = models.ForeignKey(
        'personnes.Personne', on_delete=models.CASCADE, related_name='liens_entrants'
    )
    type_lien = models.ForeignKey(TypeLien, on_delete=models.PROTECT, related_name='liens')
    description = models.TextField(blank=True)
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    est_bidirectionnel = models.BooleanField(default=True)
    intensite = models.IntegerField(default=1, help_text="Force du lien : 1 (faible) à 5 (fort)")

    source = models.ForeignKey(
        'sources.Source', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='liens'
    )

    # Modération
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    nb_validations_vrai = models.IntegerField(default=0)
    nb_validations_faux = models.IntegerField(default=0)
    nb_validations_indecis = models.IntegerField(default=0)
    score_confiance = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    cree_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='liens_crees'
    )
    modere_par = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='liens_moderes'
    )
    modere_le = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'liens'
        verbose_name = 'Lien d\'influence'
        verbose_name_plural = 'Liens d\'influence'
        unique_together = ('personne_a', 'personne_b', 'type_lien', 'source')

    def __str__(self):
        return f"{self.personne_a} → {self.personne_b} ({self.type_lien})"

    def clean(self):
        if self.personne_a_id == self.personne_b_id:
            raise ValidationError("Une personne ne peut pas être liée à elle-même.")
        if self.intensite < 1 or self.intensite > 5:
            raise ValidationError("L'intensité doit être entre 1 et 5.")

    @property
    def nb_validations_total(self):
        return self.nb_validations_vrai + self.nb_validations_faux + self.nb_validations_indecis
