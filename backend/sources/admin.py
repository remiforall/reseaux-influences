from django.contrib import admin
from .models import Source


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'media', 'type_media', 'verifiee', 'date_publication')
    list_filter = ('verifiee', 'type_media', 'media')
    search_fields = ('titre', 'media', 'url')
