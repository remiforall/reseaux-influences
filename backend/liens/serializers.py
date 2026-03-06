from rest_framework import serializers
from .models import Lien, TypeLien
from personnes.serializers import PersonneResumeSerializer
from sources.serializers import SourceSerializer


class TypeLienSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeLien
        fields = ['id', 'code', 'libelle', 'description', 'categorie', 'couleur']


class LienSerializer(serializers.ModelSerializer):
    personne_a_detail = PersonneResumeSerializer(source='personne_a', read_only=True)
    personne_b_detail = PersonneResumeSerializer(source='personne_b', read_only=True)
    type_lien_detail = TypeLienSerializer(source='type_lien', read_only=True)
    source_detail = SourceSerializer(source='source', read_only=True)
    nb_validations_total = serializers.IntegerField(read_only=True)

    class Meta:
        model = Lien
        fields = [
            'id', 'personne_a', 'personne_b', 'type_lien', 'description',
            'date_debut', 'date_fin', 'est_bidirectionnel', 'intensite',
            'source', 'statut', 'nb_validations_vrai', 'nb_validations_faux',
            'nb_validations_indecis', 'nb_validations_total', 'score_confiance',
            'created_at',
            # Détails imbriqués (lecture seule)
            'personne_a_detail', 'personne_b_detail', 'type_lien_detail', 'source_detail',
        ]
        read_only_fields = [
            'id', 'statut', 'nb_validations_vrai', 'nb_validations_faux',
            'nb_validations_indecis', 'score_confiance', 'created_at',
        ]


class LienGrapheSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour le graphe D3.js."""
    source_nom = serializers.CharField(source='personne_a.nom_complet', read_only=True)
    target_nom = serializers.CharField(source='personne_b.nom_complet', read_only=True)
    type_code = serializers.CharField(source='type_lien.code', read_only=True)
    type_couleur = serializers.CharField(source='type_lien.couleur', read_only=True)

    class Meta:
        model = Lien
        fields = [
            'id', 'personne_a', 'personne_b', 'source_nom', 'target_nom',
            'type_code', 'type_couleur', 'intensite', 'score_confiance',
        ]
