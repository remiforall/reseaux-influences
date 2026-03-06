from django.contrib import admin
from .models import TypeLien, Lien


@admin.register(TypeLien)
class TypeLienAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'code', 'categorie', 'couleur')


@admin.register(Lien)
class LienAdmin(admin.ModelAdmin):
    list_display = ('personne_a', 'personne_b', 'type_lien', 'statut', 'score_confiance', 'created_at')
    list_filter = ('statut', 'type_lien')
    search_fields = ('personne_a__nom', 'personne_b__nom', 'description')
