from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ValidationViewSet

router = DefaultRouter()
router.register('', ValidationViewSet, basename='validations')

urlpatterns = [
    path('', include(router.urls)),
]
