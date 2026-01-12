from rest_framework import serializers
from .models import Organization, Branch
from .utils import authenticate_organization, authenticate_branch

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['slug', 'title', 'subdomain', 'description', 'metadata']

class BranchSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    class Meta:
        model = Branch
        fields = ['slug', 'title', 'description', 'metadata', 'organization']

class BranchListRequestSerializer(serializers.Serializer):
    pass

class BranchListResponseSerializer(serializers.Serializer):
    """Schema for listing branches response—used only for Swagger documentation."""
    branches = BranchSerializer(many=True)

class OrganizationLoginSerializer(serializers.Serializer):
    org_id = serializers.CharField(help_text="Organization ID or slug")
    password = serializers.CharField(write_only=True)

class BranchLoginSerializer(serializers.Serializer):
    branch_id = serializers.CharField(help_text="Branch ID or slug")
    password = serializers.CharField(write_only=True)

class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()

class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
