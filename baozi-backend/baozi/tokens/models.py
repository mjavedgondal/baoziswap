from baozi.networks.models import Network
from baozi.settings import ADDRESS_LENGTH
from baozi.users.models import User
from contracts import TOKEN_ABI
from django.db import models
from django.db.models.fields import related


class TokenManager(models.Manager):
    def get_or_create(self, address):
        obj, created = super().get_or_create(address=address)

        if created:

            decimals = Network.execute_read_method(
                function_name='decimals',
                contract_address=address,
                abi=TOKEN_ABI
            )

            symbol = Network.execute_read_method(
                function_name='symbol',
                contract_address=address,
                abi=TOKEN_ABI
            )

            name = Network.execute_read_method(
                function_name='name',
                contract_address=address,
                abi=TOKEN_ABI
            )

            obj.decimals = decimals
            obj.symbol = symbol
            obj.name = name
            obj.save()

            return obj, True

        return obj, created


class Token(models.Model):

    objects = TokenManager()

    address = models.CharField(max_length=ADDRESS_LENGTH, unique=True)
    name = models.CharField(max_length=256, null=True)
    symbol = models.CharField(max_length=256, null=True)
    decimals = models.IntegerField(null=True)
    users = models.ManyToManyField(User, related_name='tokens')
