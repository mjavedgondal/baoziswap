from baozi.pools.models import Pool
from baozi.tokens.serializers import TokenSerializer
from baozi.users.models import User
from baozi.users.serializers import UserSerializer
from django.db.models import fields
from rest_framework import serializers


class PoolSerializer(serializers.ModelSerializer):
    token0 = TokenSerializer()
    token1 = TokenSerializer()
    providers = UserSerializer(many=True)

    class Meta:
        model = Pool
        fields = '__all__'
