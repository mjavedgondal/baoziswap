import { contracts } from '../config';
import { tokenList } from '../config/tokens';
import { poolsApi } from '../services/api';
import { rootStore } from '../store/store';

import { clogData } from './logger';

const { contract, type } = contracts;

export const findPath = async (startAddress: string, endAddress: string): Promise<string[]> => {
  const tokens = [...tokenList, ...rootStore.user.importedTokens];
  const res = await poolsApi.getPools();
  const pairs = res.data;
  const WTRX = contract.WTRX.chain[type].address;
  let openPaths = new Set([[startAddress]]);
  const closedPaths: string[][] = [];
  const tokensAddresses = tokens.map((token) => {
    if (token.address === '') return WTRX;
    return token.address;
  });
  clogData('addresses:', tokensAddresses);
  const otherAddresses = tokensAddresses.filter((address) => address !== startAddress);

  while (openPaths.size > 0) {
    const nextPaths: string[][] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const openPath of Array.from(openPaths)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const address of otherAddresses) {
        if (!openPath.includes(address)) {
          pairs.forEach((pair: any) => {
            if (
              (pair.token0.address === openPath[openPath.length - 1] &&
                pair.token1.address === address) ||
              (pair.token0.address === address &&
                pair.token1.address === openPath[openPath.length - 1])
            ) {
              if (address === endAddress) {
                closedPaths.push([...openPath, address]);
              } else nextPaths.push([...openPath, address]);
            }
          });
        }
      }
    }
    openPaths = new Set(nextPaths);
  }
  closedPaths.sort((a: string[], b: string[]) => {
    return a.length - b.length;
  });
  clogData('sorted Paths:', closedPaths);
  return closedPaths[0] ?? [];
};
