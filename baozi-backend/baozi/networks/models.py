import logging

from baozi.settings import ENDPOINT, START_BLOCK_FOR_SCANNER
from django.db import models
from tronpy import Tron as TronPy
from tronpy.providers import HTTPProvider as TronHTTPProvider


class Network(models.Model):
    last_block = models.IntegerField(default=START_BLOCK_FOR_SCANNER)

    @staticmethod
    def execute_read_method(function_name, contract_address, abi):

        provider = TronHTTPProvider(ENDPOINT)
        tron = TronPy(provider=provider)
        contract = tron.get_contract(contract_address)
        contract.abi = abi

        try:
            result = getattr(contract.functions, function_name)()
            return result
        except Exception:
            logging.exception('exception while trying execute read method')
            return None
    
