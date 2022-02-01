import logging

from baozi.networks.models import Network
from baozi.pools.models import Pool
from baozi.tokens.models import Token
from baozi.users.models import User
from contracts import POOL_ABI
from django.db import transaction
from tronpy.keys import to_base58check_address


@transaction.atomic
def handle_pair_created(event_data):
    result = event_data["result"]
    token_0 = result['token0']
    token_1 = result['token1']
    pair_address = result['pair']

    token_0_object, _ = Token.objects.get_or_create(
        address=to_base58check_address(token_0)
    )

    token_1_object, _ = Token.objects.get_or_create(
        address=to_base58check_address(token_1)
    )

    obj, _ = Pool.objects.get_or_create(
        address=to_base58check_address(pair_address.lower()),
        token0=token_0_object,
        token1=token_1_object,
    )


@transaction.atomic
def handle_mint(event_data):
    result = event_data["result"]
    sender = result['sender']
    pair_address = result['pair']
    amount_0 = result['amount0']
    amount_1 = result['amount1']

    pool_object = Pool.objects.filter(
        address=to_base58check_address(pair_address.lower())).first()
    if not pool_object:

        token_0 = Network.execute_read_method(
            function_name="token0",
            contract_address=to_base58check_address(pair_address.lower()),
            abi=POOL_ABI
        )

        token_1 = Network.execute_read_method(
            function_name="token1",
            contract_address=to_base58check_address(pair_address.lower()),
            abi=POOL_ABI
        )

        token_0_object, _ = Token.objects.get_or_create(
            address=to_base58check_address(token_0.lower())
        )

        token_1_object, _ = Token.objects.get_or_create(
            address=to_base58check_address(token_1.lower())
        )

        pool_object, _ = Pool.objects.get_or_create(
            address=to_base58check_address(pair_address.lower()),
            token0=token_0_object,
            token1=token_1_object
        )

    user_object, _ = User.objects.get_or_create(
        address=to_base58check_address(sender.lower())
    )

    pool_object.providers.add(user_object)
