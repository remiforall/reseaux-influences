from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SourceViewSet

router = DefaultRouter()
router.register('', SourceViewSet, basename='sources')

urlpatterns = [
    path('', include(router.urls)),
]
