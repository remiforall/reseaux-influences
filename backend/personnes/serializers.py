from rest_framework import serializers
from .models import Personne


class PersonneSerializer(serializers.ModelSerializer):
    nom_complet = serializers.CharField(read_only=True)

    class Meta:
        model = Personne
        fields = [
            'id', 'nom', 'prenom', 'nom_complet', 'pays', 'nationalite',
            'date_naissance', 'role_principal', 'bio', 'photo_url',
            'wikipedia_url', 'wikidata_id', 'statut', 'created_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at']


class PersonneResumeSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes et auto-complétion."""
    nom_complet = serializers.CharField(read_only=True)

    class Meta:
        model = Personne
        fields = ['id', 'nom_complet', 'pays', 'role_principal', 'photo_url']
