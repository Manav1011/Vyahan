from django.test import TestCase, Client
from django.urls import reverse
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from .models import Organization, Branch
import json


class OrganizationAuthenticationTests(TestCase):
    """Test Organization login, token refresh, and logout with blacklisting."""
    
    def setUp(self):
        """Create test organization and branch."""
        self.client = Client()
        self.org = Organization.objects.create(
            title="Test Organization",
            subdomain="test",
            password="TestPassword123"
        )
        self.branch = Branch.objects.create(
            organization=self.org,
            title="Test Branch",
            password="BranchPassword123"
        )
    
    def test_organization_login(self):
        """Test organization login returns access and refresh tokens."""
        response = self.client.post(
            '/api/organization/login/',
            data=json.dumps({
                'org_id': self.org.slug,
                'password': 'TestPassword123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('access', data['data'])
        self.assertIn('refresh', data['data'])
        
        self.access_token = data['data']['access']
        self.refresh_token = data['data']['refresh']
    
    def test_access_token_works(self):
        """Test access token can be used to access protected endpoints."""
        # First login
        response = self.client.post(
            '/api/organization/login/',
            data=json.dumps({
                'org_id': self.org.slug,
                'password': 'TestPassword123'
            }),
            content_type='application/json'
        )
        access_token = response.json()['data']['access']
        
        # Use token to access branches endpoint
        response = self.client.get(
            '/api/organization/branches/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('branches', data['data'])
    
    def test_refresh_token_rotation(self):
        """Test refresh token blacklists old token and issues new ones."""
        # Login
        response = self.client.post(
            '/api/organization/login/',
            data=json.dumps({
                'org_id': self.org.slug,
                'password': 'TestPassword123'
            }),
            content_type='application/json'
        )
        old_refresh = response.json()['data']['refresh']
        old_access = response.json()['data']['access']
        
        # Refresh tokens
        response = self.client.post(
            '/api/organization/token/refresh/',
            data=json.dumps({'refresh': old_refresh}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        new_refresh = response.json()['data']['refresh']
        new_access = response.json()['data']['access']
        
        # Verify tokens are different
        self.assertNotEqual(old_refresh, new_refresh)
        self.assertNotEqual(old_access, new_access)
        
        # Try to use old refresh token again - should fail
        response = self.client.post(
            '/api/organization/token/refresh/',
            data=json.dumps({'refresh': old_refresh}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid or expired refresh token', response.json()['message'])
    
    def test_logout_blacklists_refresh_token(self):
        """Test logout blacklists refresh token."""
        # Login
        response = self.client.post(
            '/api/organization/login/',
            data=json.dumps({
                'org_id': self.org.slug,
                'password': 'TestPassword123'
            }),
            content_type='application/json'
        )
        refresh_token = response.json()['data']['refresh']
        access_token = response.json()['data']['access']
        
        # Logout
        response = self.client.post(
            '/api/organization/logout/',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['message'], 'Logout successful')
        
        # Try to use refresh token - should fail
        response = self.client.post(
            '/api/organization/token/refresh/',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid or expired refresh token', response.json()['message'])
    
    def test_access_token_still_works_after_logout(self):
        """Test access token still works after logout (until it expires)."""
        # Login
        response = self.client.post(
            '/api/organization/login/',
            data=json.dumps({
                'org_id': self.org.slug,
                'password': 'TestPassword123'
            }),
            content_type='application/json'
        )
        refresh_token = response.json()['data']['refresh']
        access_token = response.json()['data']['access']
        
        # Access protected endpoint before logout
        response = self.client.get(
            '/api/organization/branches/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        self.assertEqual(response.status_code, 200)
        
        # Logout
        self.client.post(
            '/api/organization/logout/',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )
        
        # Access token still works (not blacklisted, just short-lived)
        response = self.client.get(
            '/api/organization/branches/',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        self.assertEqual(response.status_code, 200)
        
        # But refresh is blacklisted, so can't get new tokens
        response = self.client.post(
            '/api/organization/token/refresh/',
            data=json.dumps({'refresh': refresh_token}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)


class BranchAuthenticationTests(TestCase):
    """Test Branch login, token refresh, and logout with blacklisting."""
    
    def setUp(self):
        """Create test organization and branch."""
        self.client = Client()
        self.org = Organization.objects.create(
            title="Test Organization",
            subdomain="test",
            password="TestPassword123"
        )
        self.branch = Branch.objects.create(
            organization=self.org,
            title="Test Branch",
            password="BranchPassword123"
        )
    
    def test_branch_login(self):
        """Test branch login returns access and refresh tokens."""
        response = self.client.post(
            '/api/organization/branch/login/',
            data=json.dumps({
                'branch_id': self.branch.slug,
                'password': 'BranchPassword123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('data', data)
        self.assertIn('access', data['data'])
        self.assertIn('refresh', data['data'])
    
    def test_branch_refresh_token_rotation(self):
        """Test branch refresh token blacklists old token."""
        # Login
        response = self.client.post(
            '/api/organization/branch/login/',
            data=json.dumps({
                'branch_id': self.branch.slug,
                'password': 'BranchPassword123'
            }),
            content_type='application/json'
        )
        old_refresh = response.json()['data']['refresh']
        
        # Refresh tokens
        response = self.client.post(
            '/api/organization/token/refresh/',
            data=json.dumps({'refresh': old_refresh}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        new_refresh = response.json()['data']['refresh']
        
        # Verify old token is now invalid
        response = self.client.post(
            '/api/organization/token/refresh/',
            data=json.dumps({'refresh': old_refresh}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)


class TokenBlacklistTests(TestCase):
    """Test token blacklist functionality directly."""
    
    def setUp(self):
        """Create test organization."""
        self.org = Organization.objects.create(
            title="Test Organization",
            subdomain="test",
            password="TestPassword123"
        )
    
    def test_blacklist_entries_created(self):
        """Test that blacklist entries are created in database."""
        from rest_framework_simplejwt.tokens import RefreshToken
        
        # Create a token
        refresh = RefreshToken()
        refresh['sub_type'] = 'org'
        refresh['sub_id'] = self.org.slug
        jti = refresh['jti']
        
        # Blacklist it using the blacklist method
        refresh.blacklist()
        
        # Verify it's now blacklisted
        blacklisted = BlacklistedToken.objects.filter(token__jti=jti).exists()
        self.assertTrue(blacklisted)
