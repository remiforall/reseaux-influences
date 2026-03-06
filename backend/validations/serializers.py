from rest_framework import serializers
from .models import Validation


class ValidationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Validation
        fields = ['id', 'lien', 'verdict', 'commentaire', 'source_supplementaire', 'created_at']
        read_only_fields = ['id', 'created_at']
