from django.db import models
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Shipment, ShipmentHistory, ShipmentStatus
from .serializers import ShipmentSerializer, ShipmentCreateSerializer, ShipmentHistorySerializer
from core.utils import response
from organization.permissions import IsOrganizationSet
from core.authentication import VyahanJWTAuthentication

@swagger_auto_schema(
    method='post',
    request_body=ShipmentCreateSerializer,
    responses={201: ShipmentSerializer},
    operation_description="Book a new shipment. Requires Branch authentication.",
    security=[{'Bearer': []}]
)
@api_view(['POST'])
@authentication_classes([VyahanJWTAuthentication])
@permission_classes([IsOrganizationSet])
def create_shipment(request):
    org = getattr(request, 'organization', None)
    branch = getattr(request, 'branch', None)
    
    if not org or not branch:
        return response(status.HTTP_401_UNAUTHORIZED, "Organization or Branch context missing")
    
    serializer = ShipmentCreateSerializer(data=request.data)
    if serializer.is_valid():
        shipment = serializer.save(organization=org, source_branch=branch)
        
        # Create initial history entry
        ShipmentHistory.objects.create(
            shipment=shipment,
            status=ShipmentStatus.BOOKED,
            location=branch.title,
            remarks="Shipment booked successfully."
        )
        
        resp_serializer = ShipmentSerializer(shipment)
        return response(status.HTTP_201_CREATED, "Shipment booked successfully", data=resp_serializer.data)
    return response(status.HTTP_400_BAD_REQUEST, "Invalid data", error=serializer.errors)

@swagger_auto_schema(
    method='get',
    responses={200: ShipmentSerializer(many=True)},
    operation_description="List shipments. Admins see all, Branch managers see related shipments.",
    security=[{'Bearer': []}]
)
@api_view(['GET'])
@authentication_classes([VyahanJWTAuthentication])
@permission_classes([IsOrganizationSet])
def list_shipments(request):
    org = getattr(request, 'organization', None)
    if not org:
        return response(status.HTTP_404_NOT_FOUND, "Organization not found")
    
    # Check if admin or branch
    is_org_admin = request.branch is None
    branch = getattr(request, 'branch', None)
    
    if is_org_admin:
        shipments = Shipment.objects.filter(organization=org)
    elif branch:
        # Filter for incoming or outgoing
        shipments = Shipment.objects.filter(
            models.Q(source_branch=branch) | models.Q(destination_branch=branch),
            organization=org
        )
    else:
        return response(status.HTTP_401_UNAUTHORIZED, "Valid authentication required")

    serializer = ShipmentSerializer(shipments, many=True)
    return response(status.HTTP_200_OK, "Shipments fetched successfully", data=serializer.data)

@swagger_auto_schema(
    method='patch',
    responses={200: ShipmentSerializer},
    operation_description="Update shipment status. Requires Branch authentication.",
    security=[{'Bearer': []}]
)
@api_view(['PATCH'])
@authentication_classes([VyahanJWTAuthentication])
@permission_classes([IsOrganizationSet])
def update_shipment_status(request, tracking_id):
    org = getattr(request, 'organization', None)
    branch = getattr(request, 'branch', None)
    
    try:
        shipment = Shipment.objects.get(tracking_id=tracking_id, organization=org)
    except Shipment.DoesNotExist:
        return response(status.HTTP_404_NOT_FOUND, "Shipment not found")
    
    new_status = request.data.get('status')
    remarks = request.data.get('remarks', "")
    
    if new_status not in ShipmentStatus.values:
        return response(status.HTTP_400_BAD_REQUEST, "Invalid status")
    
    # Update status
    shipment.current_status = new_status
    shipment.save()
    
    # Create history entry
    ShipmentHistory.objects.create(
        shipment=shipment,
        status=new_status,
        location=branch.title,
        remarks=remarks
    )
    
    serializer = ShipmentSerializer(shipment)
    return response(status.HTTP_200_OK, f"Status updated to {new_status}", data=serializer.data)

@swagger_auto_schema(
    method='get',
    responses={200: ShipmentSerializer},
    operation_description="Track a shipment publicly."
)
@api_view(['GET'])
@permission_classes([AllowAny])
def track_shipment(request, tracking_id):
    org = getattr(request, 'organization', None) # Still want to scope it to the org if possible
    
    try:
        # We allow public tracking even if org isn't set via subdomain if we want, 
        # but better to scope it.
        query = Shipment.objects.filter(tracking_id=tracking_id)
        if org:
            query = query.filter(organization=org)
            
        shipment = query.get()
    except Shipment.DoesNotExist:
        return response(status.HTTP_404_NOT_FOUND, "Shipment not found")
        
    serializer = ShipmentSerializer(shipment)
    return response(status.HTTP_200_OK, "Tracking info fetched", data=serializer.data)
