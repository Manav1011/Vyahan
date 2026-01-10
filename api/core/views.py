
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema

from core.models import User
from core.serializers import UserSerializer, RegisterSerializer, BaseResponseSerializer
from core.utils import response

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@swagger_auto_schema(method='post', request_body=RegisterSerializer, responses={201: BaseResponseSerializer}, tags=['users'])
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return response(
            status.HTTP_201_CREATED,
            "User created successfully.",
            data=UserSerializer(user).data,
            error=None
        )
    return response(
        status.HTTP_400_BAD_REQUEST,
        "User creation failed.",
        data=None,
        error=serializer.errors
    )
