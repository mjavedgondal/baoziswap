import base58
from baozi.networks.models import Network
from baozi.tokens.models import Token
from baozi.tokens.serializers import TokenSerializer
from baozi.users.models import User
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from tronpy.keys import is_base58check_address

class TokenView(APIView):

    @swagger_auto_schema(
        responses={
            200: TokenSerializer(many=True),
            400: '',
        }
    )
    def get(self, request, user_address):

        if not is_base58check_address(user_address):
            return Response('invalid user_address', status=status.HTTP_400_BAD_REQUEST)

        objects, _ = User.objects.get_or_create(
            address=user_address
        )
        serializer = TokenSerializer(objects.tokens, many=True)

        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK
        )

    @transaction.atomic
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "token_address": openapi.Schema(type=openapi.TYPE_STRING),
            },
        ),
        responses={
            200: TokenSerializer(many=True),
            400: '',
        }
    )
    def post(self, request, user_address):
        data = request.data
        token_address = data.get('token_address')

        if not is_base58check_address(token_address):
            return Response('invalid token_address', status=status.HTTP_400_BAD_REQUEST)

        if not is_base58check_address(user_address):
            return Response('invalid user_address', status=status.HTTP_400_BAD_REQUEST)

        user, _ = User.objects.get_or_create(address=user_address)

        token, _ = Token.objects.get_or_create(address=token_address)

        token.users.add(user)

        return Response(
            data=TokenSerializer(token).data,
            status=status.HTTP_200_OK
        )
