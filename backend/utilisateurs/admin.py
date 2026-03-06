from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur, Badge, UtilisateurBadge


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ('email', 'pseudo', 'role_plateforme', 'points', 'niveau', 'validations_effectuees')
    list_filter = ('role_plateforme', 'niveau', 'is_active')
    search_fields = ('email', 'pseudo', 'first_name', 'last_name')
    fieldsets = UserAdmin.fieldsets + (
        ('Profil', {'fields': ('pseudo', 'bio', 'avatar_url', 'role_plateforme')}),
        ('Gamification', {'fields': ('points', 'niveau', 'validations_effectuees', 'soumissions_effectuees', 'soumissions_acceptees', 'taux_precision')}),
    )


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'code', 'categorie', 'est_actif')
    list_filter = ('categorie', 'est_actif')


@admin.register(UtilisateurBadge)
class UtilisateurBadgeAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'badge', 'attribue_le')
    list_filter = ('badge',)
