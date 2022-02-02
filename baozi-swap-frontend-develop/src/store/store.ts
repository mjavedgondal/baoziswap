import { createContext, useContext } from 'react';
import { Instance, onSnapshot, types } from 'mobx-state-tree';

import { clogData } from '../utils/logger';

import { Modals } from './Modals';
import { User } from './User';

const RootModel = types.model({
  modals: Modals,
  user: User,
});

export const Store = RootModel.create({
  modals: {
    info: {
      msg: '',
      type: '',
    },
    tokenSelect: {
      isOpen: false,
      isIn: true,
    },
    options: {
      isOpen: false,
      slippage: '0.5',
      deadline: '30',
      multihops: true,
    },
    userInfo: {
      isOpen: false,
    },
    removeLiquidity: {
      isOpen: false,
      tokenA: '',
      tokenB: '',
      decimalsA: 0,
      decimalsB: 0,
      decimalsLP: 0,
      liquidityAmount: '',
      firstTokenAmount: '',
      secondTokenAmount: '',
      firstTokenPrice: 1,
      secondTokenPrice: 1,
    },
  },
  user: {
    address: '',
    balance: '0',
    importedTokens: [],
    tokenIndex: {
      first: 0,
      second: 1,
    },
  },
});

export const rootStore = Store;

onSnapshot(rootStore, (snapshot) => {
  clogData('Snapshot:', snapshot);
});

export type RootInstance = Instance<typeof RootModel>;
const RootStoreContext = createContext<null | RootInstance>(null);

export const { Provider } = RootStoreContext;

export function useMst(): any {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider');
  }
  return store;
}
