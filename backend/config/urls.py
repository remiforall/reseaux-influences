from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/personnes/', include('personnes.urls')),
    path('api/liens/', include('liens.urls')),
    path('api/sources/', include('sources.urls')),
    path('api/utilisateurs/', include('utilisateurs.urls')),
    path('api/validations/', include('validations.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('accounts/', include('allauth.urls')),
]
