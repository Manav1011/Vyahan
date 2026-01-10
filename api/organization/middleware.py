from organization.models import Organization
class OrganizationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]
        subdomain = host.split('.')[0]
        try:
            organization = Organization.objects.get(subdomain=subdomain)
            request.organization = organization
        except Organization.DoesNotExist:
            request.organization = None
        return self.get_response(request)