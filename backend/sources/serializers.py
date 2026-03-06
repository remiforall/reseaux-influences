from rest_framework import serializers
from .models import Source


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = [
            'id', 'url', 'titre', 'media', 'type_media', 'langue',
            'pays_media', 'date_publication', 'auteur', 'description',
            'verifiee', 'created_at',
        ]
        read_only_fields = ['id', 'verifiee', 'created_at']
