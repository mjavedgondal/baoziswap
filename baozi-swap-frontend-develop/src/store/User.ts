import { applySnapshot, types } from 'mobx-state-tree';

import { TRXLogo } from '../assets/icons/tokens';

const Token = types.model({
  id: types.number,
  address: types.string,
  name: types.string,
  symbol: types.string,
  decimals: types.number,
  logo: TRXLogo,
});

export const User = types
  .model({
    address: types.string,
    balance: types.string,
    importedTokens: types.optional(types.array(Token), []),
    tokenIndex: types.model({
      first: types.optional(types.number, 0),
      second: types.optional(types.number, 1),
    }),
  })
  .actions((self) => {
    const setAddress = (addr: string) => {
      self.address = addr;
    };
    const setBalance = (balance: string) => {
      self.balance = balance;
    };
    const setImportedTokens = (tokens: any) => {
      tokens.forEach((token: any) => {
        token.logo = TRXLogo;
      });
      self.importedTokens = tokens;
    };
    const setFirstIndex = (index: number) => {
      self.tokenIndex.first = index;
    };
    const setSecondIndex = (index: number) => {
      self.tokenIndex.second = index;
    };
    const update = () => {
      applySnapshot(self, {
        address: self.address,
        balance: self.balance,
        importedTokens: self.importedTokens,
        tokenIndex: self.tokenIndex,
      });
    };
    const disconnect = () => {
      self.address = '';
      delete localStorage.user;
    };

    return {
      setAddress,
      setBalance,
      setFirstIndex,
      setSecondIndex,
      setImportedTokens,
      update,
      disconnect,
    };
  });
