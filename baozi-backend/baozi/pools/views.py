import base58
from baozi.networks.models import Network
from baozi.pools.models import Pool
from baozi.pools.serializers import PoolSerializer
from drf_yasg.utils import swagger_auto_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from tronpy.keys import is_base58check_address


class PoolView(APIView):

    @swagger_auto_schema(
        responses={
            200: PoolSerializer(many=True),
            400: '',
        }
    )
    def get(self, request):

        objects = Pool.objects.all()

        serializer = PoolSerializer(objects, many=True)

        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )


class PoolByAddressView(APIView):

    @swagger_auto_schema(
        responses={
            200: PoolSerializer(many=True),
            400: '',
        }
    )
    def get(self, request, address):

        if not is_base58check_address(address):
            return Response('invalid user_address', status=status.HTTP_400_BAD_REQUEST)

        objects = Pool.objects.filter(
            providers__address=address
        )

        serializer = PoolSerializer(objects, many=True)

        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )
