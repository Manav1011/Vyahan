from django.urls import path
from .views import (
    list_branches, organization_login, branch_login, 
    refresh_tokens, logout, health_check,
    organization_branches_list, branch_transfer_list,
    create_branch, delete_branch, create_organization
)

urlpatterns = [
    path('login/', organization_login, name='organization_login'),
    path('create/', create_organization, name='create_organization'),
    path('branch/login/', branch_login, name='branch_login'),
    path('token/refresh/', refresh_tokens, name='refresh_tokens'),
    path('logout/', logout, name='logout'),
    path('branches/', list_branches, name='list_branches'),
    path('branches/admin/', organization_branches_list, name='organization_branches_list'),
    path('branches/admin/create/', create_branch, name='create_branch'),
    path('branches/admin/<slug:branch_slug>/delete/', delete_branch, name='delete_branch'),
    path('branch/branches/other/', branch_transfer_list, name='branch_transfer_list'),
    path('health/', health_check, name='health_check'),
]
