from django.contrib import admin
from .models import Validation


@admin.register(Validation)
class ValidationAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'lien', 'verdict', 'created_at')
    list_filter = ('verdict',)
    search_fields = ('utilisateur__pseudo', 'lien__description')
