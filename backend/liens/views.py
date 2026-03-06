from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lien, TypeLien
from .serializers import LienSerializer, LienGrapheSerializer, TypeLienSerializer
from personnes.models import Personne
from personnes.serializers import PersonneResumeSerializer


class TypeLienViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TypeLien.objects.all()
    serializer_class = TypeLienSerializer
    permission_classes = [permissions.AllowAny]


class LienViewSet(viewsets.ModelViewSet):
    queryset = Lien.objects.select_related(
        'personne_a', 'personne_b', 'type_lien', 'source'
    ).all()
    serializer_class = LienSerializer
    filterset_fields = ['statut', 'type_lien', 'personne_a', 'personne_b']
    search_fields = ['personne_a__nom', 'personne_b__nom', 'description']
    ordering_fields = ['created_at', 'score_confiance']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            return Response(
                {'error': 'Vous devez être connecté pour soumettre un lien.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.peut_soumettre():
            return Response(
                {'error': f'Vous devez valider encore {user.validations_restantes()} liens avant de pouvoir soumettre.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer.save(cree_par=user)
        user.soumissions_effectuees += 1
        user.save(update_fields=['soumissions_effectuees'])

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def graphe(self, request):
        """Retourne les données pour le graphe D3.js (noeuds + arêtes)."""
        liens = Lien.objects.filter(statut='valide').select_related(
            'personne_a', 'personne_b', 'type_lien'
        )

        # Collecter les personnes uniques
        personne_ids = set()
        for lien in liens:
            personne_ids.add(lien.personne_a_id)
            personne_ids.add(lien.personne_b_id)

        personnes = Personne.objects.filter(id__in=personne_ids)

        return Response({
            'nodes': PersonneResumeSerializer(personnes, many=True).data,
            'links': LienGrapheSerializer(liens, many=True).data,
        })
