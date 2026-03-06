from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LienViewSet, TypeLienViewSet

router = DefaultRouter()
router.register('types', TypeLienViewSet, basename='types-liens')
router.register('', LienViewSet, basename='liens')

urlpatterns = [
    path('', include(router.urls)),
]
