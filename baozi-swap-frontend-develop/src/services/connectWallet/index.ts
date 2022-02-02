import { rootStore } from '../../store/store';
import { clog } from '../../utils/logger';
import { tokensApi } from '../api';

const MS_RETRY_TRON = 2000;
const MAX_ATTEMPT_GET_BALANCE = 5;
const MS_RETRY_GET_BALANCE = 1500;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getTronBalance(address: string): Promise<any> {
  for (let i = 0; i < MAX_ATTEMPT_GET_BALANCE; i += 1) {
    try {
      if (address) {
        // eslint-disable-next-line no-await-in-loop
        const balance = await window.tronWeb.trx.getBalance(address);
        // eslint-disable-next-line no-await-in-loop
        return Number(await window.tronWeb.fromSun(balance));
      }

      return 0;
    } catch (err: any) {
      if (i < MAX_ATTEMPT_GET_BALANCE - 1) {
        if (err.message === 'Network Error') {
          // eslint-disable-next-line no-await-in-loop
          await delay(MS_RETRY_GET_BALANCE);
        } else {
          throw new Error('Get Balance failed');
        }
      }
    }
  }

  throw new Error('Get Balance failed');
}

async function setConnect() {
  if (window.tronWeb) {
    if (!window.tronWeb?.defaultAddress) {
      rootStore.modals.info.setMsg('Please login to your TronLink extension', 'error');
    } else {
      const address = window.tronWeb.defaultAddress?.base58 || '';
      const balance = await getTronBalance(address);
      rootStore.user.setBalance(balance.toString());
      rootStore.user.setAddress(address);
      const tokens = await tokensApi.getTokens(address);
      if (tokens?.data.length) {
        rootStore.user.setImportedTokens(tokens.data);
      }
      rootStore.user.update();
      localStorage.baozi_user = address;
    }
  } else {
    clog('cant find tron');
  }
}

export async function connectTron(): Promise<void> {
  try {
    if (!window.tronWeb?.defaultAddress?.base58) {
      await delay(MS_RETRY_TRON);
    }
    await setConnect();
  } catch (err: any) {
    clog(err);
  }
}
