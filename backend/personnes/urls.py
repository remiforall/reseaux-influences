from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonneViewSet

router = DefaultRouter()
router.register('', PersonneViewSet, basename='personnes')

urlpatterns = [
    path('', include(router.urls)),
]
