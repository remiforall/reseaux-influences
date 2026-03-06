from django.contrib import admin
from .models import Personne


@admin.register(Personne)
class PersonneAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'pays', 'role_principal', 'statut', 'created_at')
    list_filter = ('statut', 'pays', 'role_principal')
    search_fields = ('nom', 'prenom')
