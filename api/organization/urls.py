from rest_framework.routers import DefaultRouter

from core.views import UserViewSet, signup
from .views import OrganizationViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet)

urlpatterns = [	
	path('', include(router.urls)),
]
