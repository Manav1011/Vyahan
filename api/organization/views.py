
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from organization.models import Organization
from .serializers import OrganizationSerializer

# Create your views here.

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer