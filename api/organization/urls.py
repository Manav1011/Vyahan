from django.urls import path
from .views import list_branches, organization_login, branch_login, refresh_tokens, logout

urlpatterns = [
    path('login/', organization_login, name='organization_login'),
    path('branch/login/', branch_login, name='branch_login'),
    path('token/refresh/', refresh_tokens, name='refresh_tokens'),
    path('logout/', logout, name='logout'),
    path('branches/', list_branches, name='list_branches'),
]
