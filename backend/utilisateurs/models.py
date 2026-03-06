import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    """Utilisateur de la plateforme avec champs de gamification."""

    ROLE_CHOICES = [
        ('contributeur', 'Contributeur'),
        ('moderateur', 'Modérateur'),
        ('admin', 'Administrateur'),
    ]

    NIVEAU_CHOICES = [
        ('debutant', 'Débutant'),
        ('intermediaire', 'Intermédiaire'),
        ('expert', 'Expert'),
        ('moderateur', 'Modérateur'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pseudo = models.CharField(max_length=100, unique=True, blank=True, null=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(max_length=512, blank=True)
    role_plateforme = models.CharField(max_length=50, choices=ROLE_CHOICES, default='contributeur')

    # Gamification
    points = models.IntegerField(default=0)
    niveau = models.CharField(max_length=50, choices=NIVEAU_CHOICES, default='debutant')
    validations_effectuees = models.IntegerField(default=0)
    soumissions_effectuees = models.IntegerField(default=0)
    soumissions_acceptees = models.IntegerField(default=0)
    taux_precision = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'utilisateurs'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'

    def __str__(self):
        return self.pseudo or self.email or self.username

    def peut_soumettre(self):
        """Vérifie si l'utilisateur a validé assez de liens pour soumettre."""
        from django.conf import settings
        seuil = getattr(settings, 'SEUIL_VALIDATIONS_POUR_SOUMETTRE', 5)
        return self.validations_effectuees >= seuil

    def validations_restantes(self):
        """Nombre de validations restantes avant de pouvoir soumettre."""
        from django.conf import settings
        seuil = getattr(settings, 'SEUIL_VALIDATIONS_POUR_SOUMETTRE', 5)
        return max(0, seuil - self.validations_effectuees)


class Badge(models.Model):
    """Badge de gamification attribuable aux utilisateurs."""

    CATEGORIE_CHOICES = [
        ('validation', 'Validation'),
        ('soumission', 'Soumission'),
        ('media', 'Média'),
        ('relation', 'Relation'),
        ('special', 'Spécial'),
    ]

    code = models.CharField(max_length=100, unique=True)
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    categorie = models.CharField(max_length=100, choices=CATEGORIE_CHOICES)
    icone_url = models.URLField(max_length=512, blank=True)
    couleur = models.CharField(max_length=7, blank=True)
    conditions = models.JSONField()
    est_actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'badges'
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'

    def __str__(self):
        return self.nom


class UtilisateurBadge(models.Model):
    """Association entre un utilisateur et un badge obtenu."""

    utilisateur = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE, related_name='badges_obtenus'
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='attributions')
    attribue_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'utilisateurs_badges'
        unique_together = ('utilisateur', 'badge')
        verbose_name = 'Badge attribué'
        verbose_name_plural = 'Badges attribués'

    def __str__(self):
        return f"{self.utilisateur} — {self.badge}"
