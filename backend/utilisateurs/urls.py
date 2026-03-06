from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UtilisateurViewSet, BadgeViewSet

router = DefaultRouter()
router.register('', UtilisateurViewSet, basename='utilisateurs')
router.register('badges', BadgeViewSet, basename='badges')

urlpatterns = [
    path('', include(router.urls)),
]
