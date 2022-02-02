export type TypeContracts = {
  type: 'mainnet' | 'testnet';
  contract: {
    [key: string]: {
      chain: {
        mainnet: {
          address: string;
          abi: any;
        };
        testnet: {
          address: string;
          abi: any;
        };
      };
    };
  };
};

export type TypeToken = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logo: string;
};

export type TypePool = {
  token0: TypeToken;
  token1: TypeToken;
  address: string;
};

export type TypePoolData = {
  totalSupply: string;
  reserve0: string;
  reserve1: string;
  balanceOf: string;
};
