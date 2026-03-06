from rest_framework import viewsets
from .models import Source
from .serializers import SourceSerializer


class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer
    filterset_fields = ['media', 'type_media', 'verifiee', 'langue']
    search_fields = ['titre', 'media', 'url']
    ordering_fields = ['date_publication', 'created_at']

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(cree_par=self.request.user)
        else:
            serializer.save()
