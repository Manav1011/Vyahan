# Generic base response serializer
from rest_framework import serializers
from .models import Organization, Branch
from core.serializers import UserSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    owners = UserSerializer(many=True, read_only=True)
    managers = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Organization
        fields = ['name', 'subdomain', 'metadata', 'owners', 'managers']
        
class BranchSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    managers = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = Branch
        fields = ['organization', 'name', 'location', 'managers']