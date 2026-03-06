from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Validation
from .serializers import ValidationSerializer
from liens.models import Lien


class ValidationViewSet(viewsets.ModelViewSet):
    queryset = Validation.objects.select_related('utilisateur', 'lien').all()
    serializer_class = ValidationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        lien_id = self.request.query_params.get('lien')
        if lien_id:
            qs = qs.filter(lien_id=lien_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        lien = serializer.validated_data['lien']

        # Vérifier que l'utilisateur ne valide pas son propre lien
        if lien.cree_par == user:
            raise serializers.ValidationError("Vous ne pouvez pas valider votre propre lien.")

        # Vérifier l'unicité (utilisateur + lien)
        if Validation.objects.filter(utilisateur=user, lien=lien).exists():
            raise serializers.ValidationError("Vous avez déjà validé ce lien.")

        validation = serializer.save(utilisateur=user)

        # Mettre à jour les compteurs du lien
        verdict = validation.verdict
        if verdict == 'vrai':
            lien.nb_validations_vrai += 1
        elif verdict == 'faux':
            lien.nb_validations_faux += 1
        else:
            lien.nb_validations_indecis += 1

        # Recalculer le score de confiance
        total_vf = lien.nb_validations_vrai + lien.nb_validations_faux
        if total_vf > 0:
            lien.score_confiance = (lien.nb_validations_vrai / total_vf) * 100

        # Vérifier le consensus automatique
        seuil_nb = 5  # configurable
        total = lien.nb_validations_vrai + lien.nb_validations_faux + lien.nb_validations_indecis
        if total >= seuil_nb and lien.statut == 'en_attente' and total_vf > 0:
            ratio_vrai = lien.nb_validations_vrai / total_vf
            ratio_faux = lien.nb_validations_faux / total_vf
            if ratio_vrai >= 0.7:
                lien.statut = 'valide'
                # Attribuer des points au créateur du lien
                if lien.cree_par:
                    lien.cree_par.soumissions_acceptees += 1
                    lien.cree_par.points += 5
                    lien.cree_par.save(update_fields=['soumissions_acceptees', 'points'])
            elif ratio_faux >= 0.7:
                lien.statut = 'rejete'
                if lien.cree_par:
                    lien.cree_par.points = max(0, lien.cree_par.points - 2)
                    lien.cree_par.save(update_fields=['points'])

        lien.save()

        # Mettre à jour les compteurs de l'utilisateur validateur
        user.validations_effectuees += 1
        user.points += 1
        user.save(update_fields=['validations_effectuees', 'points'])
