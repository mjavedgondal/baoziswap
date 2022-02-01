import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "baozi.settings")
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "baozi.settings")
import django

django.setup()
from baozi.networks.models import Network
from baozi.scanner.scanner import Scanner
from baozi.settings import CONTRACT_ADDRESS
from baozi.scanner.handlers import handle_mint, handle_pair_created

if __name__ == "__main__":

    network, _  = Network.objects.get_or_create(id=1)

    Scanner(
        network=network,
        contract_address=CONTRACT_ADDRESS,
        events=['PairCreated', 'Mint'],
        handlers=[handle_pair_created, handle_mint]
    ).start()
