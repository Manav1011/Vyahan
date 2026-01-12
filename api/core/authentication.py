from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from django.contrib.auth.models import AnonymousUser
from django.conf import settings
from organization.models import Organization, Branch


class OrganizationJWTAuthentication(BaseAuthentication):
    """
    JWT authentication that validates tokens and sets request.organization.
    Only accepts tokens with sub_type='org'.
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            raise AuthenticationFailed("Token required. Provide 'Authorization: Bearer <token>' header.")
        
        token_str = auth_header.split(' ')[1]
        
        try:
            backend = TokenBackend(algorithm='HS256', signing_key=settings.SECRET_KEY)
            validated_token = backend.decode(token_str, verify=True)
        except (InvalidToken, TokenError) as e:
            raise AuthenticationFailed(f"Invalid or expired token: {str(e)}")
        
        # Check if token is blacklisted
        jti = validated_token.get('jti')
        if jti and BlacklistedToken.objects.filter(token__jti=jti).exists():
            raise AuthenticationFailed("Token has been blacklisted")
        
        sub_type = validated_token.get('sub_type')
        sub_id = validated_token.get('sub_id')
        
        if sub_type != 'org':
            raise AuthenticationFailed("This endpoint requires organization authentication")
        
        if not sub_id:
            raise AuthenticationFailed("Token missing 'sub_id' claim")
        
        try:
            org = Organization.objects.get(slug=sub_id)
            request.organization = org
            request.branch = None
        except Organization.DoesNotExist:
            raise AuthenticationFailed("Organization not found")
        
        return (AnonymousUser(), validated_token)


class BranchJWTAuthentication(BaseAuthentication):
    """
    JWT authentication that validates tokens and sets request.branch and request.organization.
    Only accepts tokens with sub_type='branch'.
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            raise AuthenticationFailed("Token required. Provide 'Authorization: Bearer <token>' header.")
        
        token_str = auth_header.split(' ')[1]
        
        try:
            backend = TokenBackend(algorithm='HS256', signing_key=settings.SECRET_KEY)
            validated_token = backend.decode(token_str, verify=True)
        except (InvalidToken, TokenError) as e:
            raise AuthenticationFailed(f"Invalid or expired token: {str(e)}")
        
        # Check if token is blacklisted
        jti = validated_token.get('jti')
        if jti and BlacklistedToken.objects.filter(token__jti=jti).exists():
            raise AuthenticationFailed("Token has been blacklisted")
        
        sub_type = validated_token.get('sub_type')
        sub_id = validated_token.get('sub_id')
        
        if sub_type != 'branch':
            raise AuthenticationFailed("This endpoint requires branch authentication")
        
        if not sub_id:
            raise AuthenticationFailed("Token missing 'sub_id' claim")
        
        try:
            branch = Branch.objects.get(slug=sub_id)
            request.branch = branch
            request.organization = branch.organization
        except Branch.DoesNotExist:
            raise AuthenticationFailed("Branch not found")
        
        return (AnonymousUser(), validated_token)
