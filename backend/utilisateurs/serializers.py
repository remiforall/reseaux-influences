from rest_framework import serializers
from .models import Utilisateur, Badge, UtilisateurBadge


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'code', 'nom', 'description', 'categorie', 'icone_url', 'couleur']


class UtilisateurBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UtilisateurBadge
        fields = ['badge', 'attribue_le']


class UtilisateurPublicSerializer(serializers.ModelSerializer):
    """Profil public d'un utilisateur (badges, stats)."""
    badges_obtenus = UtilisateurBadgeSerializer(many=True, read_only=True)
    peut_soumettre = serializers.BooleanField(read_only=True)
    validations_restantes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            'id', 'pseudo', 'bio', 'avatar_url', 'role_plateforme',
            'points', 'niveau', 'validations_effectuees',
            'soumissions_effectuees', 'soumissions_acceptees', 'taux_precision',
            'badges_obtenus', 'peut_soumettre', 'validations_restantes',
            'date_joined',
        ]
