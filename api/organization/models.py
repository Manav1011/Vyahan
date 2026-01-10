from django.db import models

# Create your models here.

class Organization(models.Model):
    name = models.CharField(max_length=255, unique=True)
    subdomain = models.CharField(max_length=100, unique=True)
    metadata = models.JSONField(blank=True, null=True)
    owners = models.ManyToManyField('core.User', related_name='organization_owners', blank=True)
    managers = models.ManyToManyField('core.User', related_name='organization_managers', blank=True)

    def __str__(self):
        return self.name
    
class Branch(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    managers = models.ManyToManyField('core.User', related_name='branch_managers', blank=True)

    def __str__(self):
        return f"{self.name} - {self.organization.name}"