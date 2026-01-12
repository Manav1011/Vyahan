from rest_framework.decorators import api_view, permission_classes, authentication_classes
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import AllowAny
from rest_framework import status, serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Branch
from .utils import authenticate_organization, authenticate_branch
from core.utils import response
from .permissions import IsOrganizationSet
from core.authentication import OrganizationJWTAuthentication, BranchJWTAuthentication
from .serializers import (
    OrganizationSerializer, BranchSerializer, BranchListRequestSerializer, BranchListResponseSerializer,
    OrganizationLoginSerializer, BranchLoginSerializer, TokenResponseSerializer,
    RefreshTokenSerializer, LogoutSerializer
)


@swagger_auto_schema(
	method='post',
	request_body=RefreshTokenSerializer,
	responses={200: TokenResponseSerializer},
	operation_description="Refresh access and refresh tokens using an existing refresh token."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_tokens(request):
	serializer = RefreshTokenSerializer(data=request.data)
	if not serializer.is_valid():
		return response(status.HTTP_400_BAD_REQUEST, "Invalid request", error=serializer.errors)
	
	refresh_token_str = serializer.validated_data['refresh']
	
	try:
		# Decode to get claims, then blacklist
		old_refresh = RefreshToken(refresh_token_str)
		
		# Get the custom claims from the old token
		sub_type = old_refresh.get('sub_type')
		sub_id = old_refresh.get('sub_id')
		
		# Blacklist the old refresh token
		old_refresh.blacklist()
		
		# Create new tokens with the same claims
		new_refresh = RefreshToken()
		new_refresh['sub_type'] = sub_type
		new_refresh['sub_id'] = sub_id
		
		token_data = {
			'access': str(new_refresh.access_token),
			'refresh': str(new_refresh),
		}
		return response(status.HTTP_200_OK, "Tokens refreshed successfully", data=token_data)
	except Exception as e:
		return response(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token", error=str(e))


@swagger_auto_schema(
	method='post',
	request_body=RefreshTokenSerializer,
	responses={200: serializers.Serializer()},
	operation_description="Logout and blacklist the refresh token."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    serializer = RefreshTokenSerializer(data=request.data)
    if not serializer.is_valid():
        return response(status.HTTP_400_BAD_REQUEST, "Invalid request", error=serializer.errors)

    refresh_token_str = serializer.validated_data.get('refresh')

    if not refresh_token_str:
        return response(status.HTTP_400_BAD_REQUEST, "Refresh token is required")

    try:
        # Blacklist refresh token
        refresh = RefreshToken(refresh_token_str)
        refresh.blacklist()
        
        return response(status.HTTP_200_OK, "Logout successful")
    except Exception as e:
        return response(status.HTTP_400_BAD_REQUEST, "Invalid token", error=str(e))


@swagger_auto_schema(
	method='post',
	request_body=OrganizationLoginSerializer,
	responses={200: TokenResponseSerializer},
	operation_description="Authenticate organization with org_id and password. Returns access and refresh tokens."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def organization_login(request):
	serializer = OrganizationLoginSerializer(data=request.data)
	if not serializer.is_valid():
		return response(status.HTTP_400_BAD_REQUEST, "Invalid request", error=serializer.errors)
	
	org_id = serializer.validated_data['org_id']
	password = serializer.validated_data['password']
	
	org = authenticate_organization(org_id, password)
	if not org:
		return response(status.HTTP_401_UNAUTHORIZED, "Invalid organization credentials")
	
	refresh = RefreshToken()
	refresh['sub_type'] = 'org'
	refresh['sub_id'] = org.slug
	
	token_data = {
		'access': str(refresh.access_token),
		'refresh': str(refresh),
		'organization': OrganizationSerializer(org).data,
	}
	
	return response(status.HTTP_200_OK, "Organization login successful", data=token_data)


@swagger_auto_schema(
	method='post',
	request_body=BranchLoginSerializer,
	responses={200: TokenResponseSerializer},
	operation_description="Authenticate branch with branch_id and password. Returns access and refresh tokens."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def branch_login(request):
	serializer = BranchLoginSerializer(data=request.data)
	if not serializer.is_valid():
		return response(status.HTTP_400_BAD_REQUEST, "Invalid request", error=serializer.errors)
	
	branch_id = serializer.validated_data['branch_id']
	password = serializer.validated_data['password']
	
	branch = authenticate_branch(branch_id, password)
	if not branch:
		return response(status.HTTP_401_UNAUTHORIZED, "Invalid branch credentials")
	
	refresh = RefreshToken()
	refresh['sub_type'] = 'branch'
	refresh['sub_id'] = branch.slug
	
	token_data = {
		'access': str(refresh.access_token),
		'refresh': str(refresh),
		'branch': BranchSerializer(branch).data,
	}
	
	return response(status.HTTP_200_OK, "Branch login successful", data=token_data)


@swagger_auto_schema(
	method='get',
	query_serializer=BranchListRequestSerializer,
	responses={200: BranchListResponseSerializer},
	operation_description="Get all branches under an organization. Requires JWT token authentication.",
	security=[{'Bearer': []}]
)
@api_view(['GET'])
@permission_classes([IsOrganizationSet])
def list_branches(request):
	org = getattr(request, 'organization', None)
	if not org:
		return response(status.HTTP_404_NOT_FOUND, "Organization not found")
	branches = Branch.objects.filter(organization=org)
	resp_serializer = BranchListResponseSerializer({'branches': branches})
	return response(status.HTTP_200_OK, "Branches fetched successfully", data=resp_serializer.data)

@swagger_auto_schema(
	method='get',
	responses={200: OrganizationSerializer},
	operation_description="Check organization health and return details if subdomain is valid.",
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
	org = getattr(request, 'organization', None)
	if not org:
		return response(status.HTTP_404_NOT_FOUND, "Organization not found")
	
	org_serializer = OrganizationSerializer(org)
	branches = Branch.objects.filter(organization=org)
	branch_serializer = BranchSerializer(branches, many=True)
	
	resp_data = org_serializer.data
	resp_data['branches'] = branch_serializer.data
	
	return response(status.HTTP_200_OK, "Organization is healthy", data=resp_data)
