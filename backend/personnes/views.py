from rest_framework import viewsets, permissions
from .models import Personne
from .serializers import PersonneSerializer


class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    filterset_fields = ['pays', 'role_principal', 'statut']
    search_fields = ['nom', 'prenom']
    ordering_fields = ['nom', 'created_at']
    ordering = ['nom']

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(cree_par=self.request.user)
        else:
            serializer.save()
