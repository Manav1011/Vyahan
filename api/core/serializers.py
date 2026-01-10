# Generic base response serializer
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_active', 'is_staff', 'date_joined']


# Registration serializer for signup
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class BaseResponseSerializer(serializers.Serializer):
    status_code = serializers.IntegerField()
    message = serializers.CharField()
    data = serializers.JSONField(allow_null=True, required=False)
    error = serializers.JSONField(allow_null=True, required=False)