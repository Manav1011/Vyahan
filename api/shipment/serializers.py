from rest_framework import serializers
from .models import Shipment, ShipmentHistory, ShipmentStatus, PaymentMode
from organization.models import Branch
from organization.serializers import BranchSerializer

class ShipmentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ShipmentHistory
        fields = ['status', 'location', 'remarks', 'created_at']

class ShipmentSerializer(serializers.ModelSerializer):
    history = ShipmentHistorySerializer(many=True, read_only=True)
    source_branch = serializers.SlugRelatedField(slug_field='slug', read_only=True)
    destination_branch = serializers.SlugRelatedField(slug_field='slug', read_only=True)
    source_branch_title = serializers.ReadOnlyField(source='source_branch.title')
    destination_branch_title = serializers.ReadOnlyField(source='destination_branch.title')
    
    class Meta:
        model = Shipment
        fields = [
            'slug', 'tracking_id', 'sender_name', 'sender_phone', 
            'receiver_name', 'receiver_phone', 'description', 
            'price', 'payment_mode', 'current_status', 
            'source_branch', 'destination_branch', 
            'source_branch_title', 'destination_branch_title',
            'history', 'created_at'
        ]

class ShipmentCreateSerializer(serializers.ModelSerializer):
    destination_branch = serializers.SlugRelatedField(slug_field='slug', queryset=Branch.objects.all())
    
    class Meta:
        model = Shipment
        fields = [
            'sender_name', 'sender_phone', 'receiver_name', 
            'receiver_phone', 'description', 'price', 
            'payment_mode', 'destination_branch'
        ]

    def create(self, validated_data):
        # organization and source_branch will be passed from the view via save()
        return super().create(validated_data)
