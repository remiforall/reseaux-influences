from rest_framework import viewsets, permissions
from .models import Utilisateur, Badge
from .serializers import UtilisateurPublicSerializer, BadgeSerializer


class UtilisateurViewSet(viewsets.ReadOnlyModelViewSet):
    """Profils publics des utilisateurs."""
    queryset = Utilisateur.objects.prefetch_related('badges_obtenus__badge').filter(is_active=True)
    serializer_class = UtilisateurPublicSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['niveau', 'role_plateforme']
    search_fields = ['pseudo']
    ordering_fields = ['points', 'validations_effectuees', 'date_joined']
    ordering = ['-points']


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """Liste des badges disponibles."""
    queryset = Badge.objects.filter(est_actif=True)
    serializer_class = BadgeSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['categorie']
