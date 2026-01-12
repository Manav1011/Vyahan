# Authentication System Documentation

## Overview

The Vyahan backend implements a **JWT-based authentication system** for Organization and Branch entities. This is a **stateless, multi-tenant authentication** system that doesn't rely on Django's built-in User model.

## Architecture

### Key Components

1. **Organization & Branch Models** - Store credentials with hashed passwords
2. **SimpleJWT** - Generates and validates JWT tokens
3. **Custom Auth Classes** - `OrganizationJWTAuthentication` and `BranchJWTAuthentication`
4. **Token Blacklist** - Tracks revoked tokens for logout/refresh
5. **Middleware** - Optional subdomain-based organization detection

---

## Authentication Flow

### 1. Organization Authentication

#### Login
```bash
POST /api/organization/login/
Content-Type: application/json

{
  "org_id": "fe4c6eb5f6464730_1768210017298",  # Organization slug or ID
  "password": "your_password"
}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Organization login successful",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**Token Payload (decoded):**
```json
{
  "token_type": "access",
  "exp": 1768220158,
  "iat": 1768219258,
  "jti": "0eeb6f06bed84dd0a0cd76e6dda91dab",
  "sub_type": "org",
  "sub_id": "fe4c6eb5f6464730_1768210017298"  # Organization slug
}
```

**Token Lifetimes:**
- **Access Token**: 15 minutes (short-lived)
- **Refresh Token**: 7 days (long-lived)

---

### 2. Branch Authentication

#### Login
```bash
POST /api/organization/branch/login/
Content-Type: application/json

{
  "branch_id": "29e393086cb647e8_1768214136844",  # Branch slug or ID
  "password": "branch_password"
}
```

**Response:** Same as Organization login, but with `sub_type: "branch"`

```json
{
  "token_type": "access",
  "exp": 1768220158,
  "iat": 1768219258,
  "jti": "5f9ee94a2c8a4fda83c16c0bea31d7b9",
  "sub_type": "branch",
  "sub_id": "29e393086cb647e8_1768214136844"  # Branch slug
}
```

---

## Token Management

### Token Refresh

**Purpose:** Get new access token before expiry, blacklist old refresh token (token rotation)

```bash
POST /api/organization/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Tokens refreshed successfully",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**Security Feature:**
- Old refresh token is **automatically blacklisted**
- Old refresh token cannot be reused
- Prevents token replay attacks

### Logout

**Purpose:** Immediately invalidate the refresh token (block further refreshes)

```bash
POST /api/organization/logout/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status_code": 200,
  "message": "Logout successful",
  "data": null,
  "error": null
}
```

**What happens:**
- Refresh token is blacklisted in database
- Client can't get new access tokens
- Existing access token still works until natural expiry (~15 minutes)
- After access token expires, user must re-login

---

## Using Protected Endpoints

### Access Organization Endpoints

Include access token in `Authorization` header:

```bash
GET /api/organization/branches/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Headers Required:**
- `Authorization: Bearer <access_token>` ✅ Required
- `Content-Type: application/json` ✅ Recommended

**Endpoint:** `/api/organization/branches/`
- **Auth Required:** `OrganizationJWTAuthentication`
- **Requires:** `sub_type: "org"`
- **Returns:** List of branches for the authenticated organization

---

## Token Validation

### Custom Authentication Classes

#### OrganizationJWTAuthentication

```python
class OrganizationJWTAuthentication(BaseAuthentication):
    """
    Validates JWT tokens with sub_type='org'
    Sets request.organization
    """
```

**Validation Steps:**
1. Extract token from `Authorization: Bearer <token>` header
2. Decode JWT using Django's SECRET_KEY
3. Check token is not blacklisted
4. Verify `sub_type == 'org'`
5. Lookup Organization by `sub_id` (slug)
6. Set `request.organization` and `request.branch = None`

**Raises `AuthenticationFailed` if:**
- Token missing or invalid format
- Token signature verification fails
- Token is expired
- Token is blacklisted
- `sub_type != 'org'`
- Organization not found

#### BranchJWTAuthentication

Similar to Organization, but:
- Requires `sub_type: 'branch'`
- Sets both `request.branch` and `request.organization` (parent org)
- Only accepts branch tokens on branch endpoints

---

## Token Blacklist System

### How It Works

**Database Tables:**
- `token_blacklist_outstandingtoken` - Tracks all issued tokens
- `token_blacklist_blacklistedtoken` - Tracks revoked tokens

### Blacklisting Events

**1. Token Refresh (automatic rotation)**
```python
old_refresh = RefreshToken(refresh_token_str)
old_refresh.blacklist()  # Automatically recorded in DB
```

**2. Logout (user-initiated)**
```python
refresh = RefreshToken(refresh_token_str)
refresh.blacklist()  # Immediately invalidate session
```

### Checking Blacklist

In authentication classes:
```python
jti = validated_token.get('jti')
if BlacklistedToken.objects.filter(token__jti=jti).exists():
    raise AuthenticationFailed("Token has been blacklisted")
```

---

## Slug Generation

### What is a Slug?

A **slug** is a unique identifier for organizations and branches. It's generated on **first creation only** and never changes.

**Format:** `{random_hash}_{timestamp}`

**Example:** `fe4c6eb5f6464730_1768210017298`

### Implementation

```python
def save(self, *args, **kwargs):
    if self._state.adding:  # Only on first creation
        self.slug = generate_unique_hash()
    super().save(*args, **kwargs)
```

**Benefits:**
- ✅ Unique per entity
- ✅ Stable (never regenerated)
- ✅ Used in JWT claims
- ✅ Used for lookups

---

## Password Hashing

### Django PBKDF2 Hashing

Organizations and Branches use Django's `make_password()` function.

**Algorithm:** PBKDF2 with SHA256
**Iterations:** 260000 (Django default)

### Usage

**Setting Password:**
```python
org.password = "PlainTextPassword123"
org.save()  # Automatically hashed on save
```

**Checking Password:**
```python
from organization.models import Organization
org = Organization.objects.get(slug="...")
org.check_password("PlainTextPassword123")  # Returns True/False
```

**Hash Format:**
```
pbkdf2_sha256$260000$saltvalue$hashedvalue
```

---

## Error Handling

### Authentication Errors

**401 Unauthorized - Token Required**
```json
{
  "detail": "Token required. Provide 'Authorization: Bearer <token>' header."
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "detail": "Invalid or expired token: Token is invalid or expired"
}
```

**401 Unauthorized - Blacklisted Token**
```json
{
  "detail": "Token has been blacklisted"
}
```

**401 Unauthorized - Wrong Token Type**
```json
{
  "detail": "This endpoint requires organization authentication"
}
```

### Login Errors

**401 Unauthorized - Invalid Credentials**
```json
{
  "status_code": 401,
  "message": "Invalid organization credentials",
  "data": null,
  "error": null
}
```

**400 Bad Request - Invalid Format**
```json
{
  "status_code": 400,
  "message": "Invalid request",
  "data": null,
  "error": {
    "org_id": ["This field may not be blank."],
    "password": ["This field may not be blank."]
  }
}
```

---

## Security Features

### 1. Token Rotation
- Old tokens blacklisted immediately on refresh
- Prevents token replay even if intercepted

### 2. Short-Lived Access Tokens
- 15-minute expiry (configurable)
- Forces periodic refresh
- Limited damage from token compromise

### 3. Secure Logout
- Refresh token blacklisted immediately
- Client can't get new access tokens
- Stateless logout (no session storage needed)

### 4. Password Hashing
- PBKDF2 with 260,000 iterations
- Salted hashes
- Resistant to brute-force attacks

### 5. JWT Signature Verification
- Signed with Django's SECRET_KEY
- Tampered tokens are rejected
- Valid signature proves authenticity

### 6. Blacklist Checking
- Every request validates against blacklist
- Logout immediately effective
- No cache delay

---

## Configuration

### Settings (vyahan-be/settings.py)

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': settings.SECRET_KEY,
    'BLACKLIST_AFTER_ROTATION': True,
}

INSTALLED_APPS = [
    ...
    'rest_framework_simplejwt.token_blacklist',
]
```

### Customization

**Change Access Token Lifetime:**
```python
'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
```

**Change Refresh Token Lifetime:**
```python
'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
```

---

## API Endpoints Summary

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/organization/login/` | ❌ No | Organization login |
| POST | `/api/organization/branch/login/` | ❌ No | Branch login |
| POST | `/api/organization/token/refresh/` | ❌ No | Refresh tokens |
| POST | `/api/organization/logout/` | ❌ No | Logout (blacklist refresh) |
| GET | `/api/organization/branches/` | ✅ Yes (Org) | List branches |

---

## Testing

### Run Tests

```bash
cd /home/web-h-063/Documents/Vyahan/api
source /home/web-h-063/Documents/Vyahan/.venv/bin/activate
python manage.py test organization.tests -v 2
```

### Test Coverage

- ✅ Organization login
- ✅ Branch login
- ✅ Access token validation
- ✅ Token refresh & rotation
- ✅ Logout & blacklisting
- ✅ Protected endpoints
- ✅ Token blacklist database entries

---

## Example Client Implementation

### JavaScript/Fetch

```javascript
// 1. Login
const loginResponse = await fetch('http://sun.vyahan.local/api/organization/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    org_id: 'fe4c6eb5f6464730_1768210017298',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const accessToken = data.access;
const refreshToken = data.refresh;

// 2. Use access token
const branchesResponse = await fetch('http://sun.vyahan.local/api/organization/branches/', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// 3. Refresh tokens
const refreshResponse = await fetch('http://sun.vyahan.local/api/organization/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh: refreshToken })
});

const { data: newTokens } = await refreshResponse.json();
accessToken = newTokens.access;
refreshToken = newTokens.refresh;

// 4. Logout
await fetch('http://sun.vyahan.local/api/organization/logout/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh: refreshToken })
});
```

---

## Troubleshooting

### Token Rejected as Invalid
- ✅ Verify token hasn't expired
- ✅ Verify correct signing key in SECRET_KEY
- ✅ Check token wasn't blacklisted

### "Token has been blacklisted"
- ✅ User logged out or refreshed
- ✅ Use new tokens from refresh endpoint
- ✅ Re-login if refresh also invalid

### "This endpoint requires organization authentication"
- ✅ Using organization endpoint with branch token
- ✅ Login with correct credential type

### Password Check Failing
- ✅ Verify password is unhashed (plain text)
- ✅ Check password matches what was set
- ✅ Verify no whitespace in password

---

## Related Files

- **Models:** `organization/models.py` - Organization, Branch
- **Views:** `organization/views.py` - All endpoints
- **Auth Classes:** `core/authentication.py` - Token validation
- **Serializers:** `organization/serializers.py` - Input/output schemas
- **Tests:** `organization/tests.py` - Test suite
- **Settings:** `vyahan-be/settings.py` - JWT configuration
