from rest_framework import serializers
from baozi.tokens.models import Token
from baozi.users.serializers import UserSerializer

class TokenSerializer(serializers.ModelSerializer):
    # users = UserSerializer(many=True)

    class Meta:
        model = Token
        # fields = '__all__'
        exclude = ['users']