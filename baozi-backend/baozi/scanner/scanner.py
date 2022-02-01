import logging
import sys
import threading
import time

import requests
from baozi.networks.models import Network
from baozi.settings import ENDPOINT, MAX_BLOCKS_FOR_FILTER, MIN_BLOCKS_FOR_SCANNER, SCANNER_SLEEP_IN_SECONDS
from tronpy import Tron
from tronpy.providers import HTTPProvider

def never_fall(func):
    def wrapper(*args, **kwargs):
        while True:
            try:
                func(*args, **kwargs)
            except Exception as e:
                logging.error('EXCEPTION in SCANNER')
                logging.exception('scanner')
                logging.error('EXCEPTION in SCANNER')
                time.sleep(60)
    return wrapper


class Scanner(threading.Thread):

    def __init__(
        self,
        network: Network,
        contract_address: object = None,
        events: list = [],
        handlers: list = []
    ) -> None:
        super().__init__()
        self.network = network
        self.contract_address = contract_address
        self.events = events
        self.handlers = handlers

    def run(self):
        self.start_polling()

    @never_fall
    def start_polling(self) -> None:
        while True:
            last_checked_block = self.get_last_block()
            last_network_block = self.get_last_network_block()

            logging.info(f'last_checked_block {last_checked_block}')
            logging.info(f'last_network_block {last_network_block}')

            if not last_checked_block or not last_network_block:
                self.sleep()
                continue

            if last_network_block - last_checked_block < MIN_BLOCKS_FOR_SCANNER:
                self.sleep()
                continue

            # filter cannot support more than 5000 blocks at one query
            if last_network_block - last_checked_block > MAX_BLOCKS_FOR_FILTER:
                last_network_block = last_checked_block + MAX_BLOCKS_FOR_FILTER

            for event, handler in zip(self.events, self.handlers):
                events_data = self.get_events(
                    last_checked_block=last_checked_block,
                    last_network_block=last_network_block,
                    event=event
                )
                for event_data in events_data:
                    logging.info(event_data)
                    handler(event_data=event_data)
            self.save_last_block(last_network_block)
            self.sleep()

    def get_tron_instance(self):
        provider = HTTPProvider(ENDPOINT)
        return Tron(provider=provider)

    def build_tronapi_url(
        self, last_checked_block, last_network_block, collection_address, event_name
    ):
        last_checked_block_timestamp = self.get_block_timestamp(
            last_checked_block)
        last_network_block_timestamp = self.get_block_timestamp(
            last_network_block)
        url = (
            f"{ENDPOINT}/v1/contracts/{collection_address}/events?event_name={event_name}"
            f"&min_block_timestamp={last_checked_block_timestamp}"
            f"&max_block_timestamp={last_network_block_timestamp}"
        )
        return url

    def get_block_timestamp(self, number):
        tron = self.get_tron_instance()
        return tron.get_block(number).get('block_header').get('raw_data').get('timestamp')

    def get_last_network_block(self):
        tron = self.get_tron_instance()
        return tron.get_latest_block().get('block_header').get('raw_data').get('number')

    def sleep(self) -> None:
        time.sleep(SCANNER_SLEEP_IN_SECONDS)

    def save_last_block(self, block) -> None:
        self.network.last_block = block
        self.network.save()

    def get_last_block(self) -> int:
        return self.network.last_block

    def get_events(self, last_checked_block, last_network_block, event):
        url = self.build_tronapi_url(
            last_checked_block,
            last_network_block,
            self.contract_address,
            event,
        )
        events = requests.get(url).json()["data"]
        return events
