import json
from pathlib import Path
from web3 import Web3, HTTPProvider
from baozi.settings import config


with Path("contracts", "factory_abi.json").open() as f:
    FACTORY_ABI = json.load(f)

with Path("contracts", "pool_abi.json").open() as f:
    POOL_ABI = json.load(f)

with Path("contracts", "token_abi.json").open() as f:
    TOKEN_ABI = json.load(f)
