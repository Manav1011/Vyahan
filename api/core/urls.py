from rest_framework.routers import DefaultRouter
from .views import UserViewSet, signup
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
	path('signup/', signup, name='signup'),
	path('', include(router.urls)),
]
