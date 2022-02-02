import React, { createContext, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';

import { contracts, isProduction, network } from '../../config';
import { rootStore } from '../../store/store';
import { clog, clogData } from '../../utils/logger';
import { connectTron } from '../connectWallet';

declare global {
  interface Window {
    tronWeb: any;
  }
}

const walletConnectContext = createContext<any>({
  connectorService: {},
});

@observer
class TronLinkService extends React.Component<any, any> {
  constructor(props: any | string) {
    super(props);

    window.addEventListener('message', (e) => {
      if (e.data.message && e.data.message.action === 'setAccount') {
        if (!e.data.message.data.address) {
          rootStore.user.disconnect();
        } else {
          connectTron();
        }
        clogData('setAccount event:', e.data.message);
      }

      if (e.data.message && e.data.message.action === 'disconnect') {
        rootStore.user.disconnect();
      }

      if (e.data.message && e.data.message.action === 'setNode') {
        clogData('setNode event:', e.data.message);
        if (e.data.message.data.node.fullNode !== network) {
          rootStore.modals.info.setMsg(
            `Please switch node to ${isProduction ? 'Mainnet (TronGrid)' : 'Shasta Testnet'}`,
            'error',
          );
        } else {
          window.location.reload();
        }
      }

      if (e.data.message && e.data.message.action === 'connect') {
        clogData('connect event:', e.data.message);
      }

      if (e.data.message && e.data.message.action === 'accountsChanged') {
        clog('accountsChanged event');
        window.location.reload();
      }
    });
  }

  componentDidMount(): void {
    if (localStorage.baozi_user) {
      connectTron();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async getContract(contractAddress: string, abi?: any | any[]): Promise<any> {
    if (window.tronWeb) {
      if (abi) {
        return window.tronWeb.contract(abi, contractAddress);
      }
      return window.tronWeb.contract().at(contractAddress);
    }
    return new Error('tronWeb is undefined');
  }

  // eslint-disable-next-line class-methods-use-this
  public async getBalance(address: string): Promise<string> {
    return window.tronWeb.trx.getBalance(address);
  }

  public async getDecimals(tokenAddress: string): Promise<string> {
    const WTRX = await this.getTRXAddress();
    const contract = await this.getContract(tokenAddress || WTRX);
    return contract.decimals().call();
  }

  public async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    const contract = await this.getContract(tokenAddress);
    const balance = await contract.balanceOf(walletAddress).call();
    // eslint-disable-next-line no-underscore-dangle
    return new BigNumber(balance._hex).toString(10);
  }

  public async getTRXAddress(): Promise<any> {
    try {
      const { contract, type } = contracts;
      const router = await this.getContract(contract.ROUTER.chain[type].address);
      const WTRX = await router.WTRX().call();
      return this.convertUserAddressFromHex(WTRX);
    } catch (err: any) {
      clog(err);
      return err;
    }
  }

  public async getPairAddress(firstTokenAddress: string, secondTokenAddress: string): Promise<any> {
    try {
      const { contract, type } = contracts;
      const factory = await this.getContract(contract.FACTORY.chain[type].address);
      const WTRXAddress = await this.getTRXAddress();
      return factory
        .getPair(firstTokenAddress || WTRXAddress, secondTokenAddress || WTRXAddress)
        .call();
    } catch (err: any) {
      clog(err);
      return err;
    }
  }

  public async getAmountOut(amountIn: string, reserveA: string, reserveB: string): Promise<any> {
    const { contract, type } = contracts;
    const router = await this.getContract(contract.ROUTER.chain[type].address);
    return router.getAmountOut(amountIn, reserveA, reserveB).call();
  }

  public async getAmountIn(amountOut: string, reserveA: string, reserveB: string): Promise<any> {
    const { contract, type } = contracts;
    const router = await this.getContract(contract.ROUTER.chain[type].address);
    return router.getAmountIn(amountOut, reserveA, reserveB).call();
  }

  public async getAmountsOut(amountIn: string, path: string[]): Promise<any> {
    const { contract, type } = contracts;
    const router = await this.getContract(contract.ROUTER.chain[type].address);
    return router.getAmountsOut(amountIn, path).call();
  }

  public async getAmountsIn(amountOut: string, path: string[]): Promise<any> {
    const { contract, type } = contracts;
    const router = await this.getContract(contract.ROUTER.chain[type].address);
    return router.getAmountsIn(amountOut, path).call();
  }

  // eslint-disable-next-line class-methods-use-this
  public convertUserAddressFromHex(address: string): string {
    return window.tronWeb.address.fromHex(address);
  }

  public async checkAllowance(
    contractType: 'token' | 'pair',
    walletAddress: string,
    contractAddress: string,
    spenderAddress: string,
  ): Promise<boolean> {
    const { contract, type } = contracts;
    const currentContract =
      contractType === 'pair'
        ? await this.getContract(contractAddress, contract.PAIR.chain[type].abi)
        : await this.getContract(contractAddress);
    const res = await currentContract
      .allowance(walletAddress, spenderAddress)
      .call({ _isConstant: true });
    // eslint-disable-next-line no-underscore-dangle
    const allowance = +new BigNumber(res._hex).toFixed(0, 1);
    const balance =
      contractType === 'token'
        ? await this.getTokenBalance(contractAddress, walletAddress)
        : await currentContract.balanceOf(walletAddress).call({ _isConstant: true });
    clogData('checkAllowance allowance:', allowance);
    clogData('checkAllowance balance:', balance);
    if (contractType === 'pair') {
      // eslint-disable-next-line no-underscore-dangle
      return allowance > 0 && allowance >= +new BigNumber(balance._hex).toFixed(0, 1);
    }
    return allowance > 0 && allowance >= +balance;
  }

  public async approveToken(
    contractType: 'token' | 'pair',
    contractAddress: string,
    spenderAddress: string,
  ): Promise<any> {
    const { contract, type } = contracts;
    const currentContract =
      contractType === 'token'
        ? await this.getContract(contractAddress)
        : await this.getContract(contractAddress, contract.PAIR.chain[type].abi);
    return currentContract
      .approve(spenderAddress, new BigNumber(2).pow(new BigNumber(256)).minus(1).toFixed(0, 1))
      .send({
        shouldPollResponse: true,
      });
  }

  public async addLiquidity(
    tokenAddressA: string,
    tokenAddressB: string,
    amountA: string,
    amountB: string,
    amountMinA: string,
    amountMinB: string,
    walletAddress: string,
    deadline: string,
  ): Promise<any> {
    const { contract, type } = contracts;
    const decimalsA = await this.getDecimals(tokenAddressA);
    const decimalsB = await this.getDecimals(tokenAddressB);
    const valueA = new BigNumber(amountA).times(10 ** +decimalsA).toFixed(0, 1);
    const valueB = new BigNumber(amountB).times(10 ** +decimalsB).toFixed(0, 1);
    const valueMinA = new BigNumber(amountMinA).times(10 ** +decimalsA).toFixed(0, 1);
    const valueMinB = new BigNumber(amountMinB).times(10 ** +decimalsB).toFixed(0, 1);
    const router = await this.getContract(contract.ROUTER.chain[type].address);
    if (tokenAddressA && tokenAddressB)
      return router
        .addLiquidity(
          tokenAddressA,
          tokenAddressB,
          valueA,
          valueB,
          valueMinA,
          valueMinB,
          walletAddress,
          deadline,
        )
        .send({
          feeLimit: 1000000000,
          shouldPollResponse: true,
        });
    return router
      .addLiquidityTRX(
        tokenAddressA || tokenAddressB,
        tokenAddressA ? valueA : valueB,
        tokenAddressA ? valueMinA : valueMinB,
        tokenAddressA ? valueMinB : valueMinA,
        walletAddress,
        deadline,
      )
      .send({
        callValue: tokenAddressA ? valueB : valueA,
        feeLimit: 1000000000,
        shouldPollResponse: true,
      });
  }

  public async removeLiquidity(
    tokenA: string,
    tokenB: string,
    liquidity: string,
    firstTokenAmount: string,
    secondTokenAmount: string,
    to: string,
    deadline: number,
    slippage: number,
  ): Promise<any> {
    const { contract, type } = contracts;
    const deadlineUTC = new BigNumber(Date.now() / 1000 + deadline * 60).toFixed(0, 1);
    const router = await this.getContract(contract.ROUTER.chain[type].address);
    const firstAmountMin = new BigNumber(firstTokenAmount)
      .minus(new BigNumber(firstTokenAmount).times(slippage))
      .toFixed(0, 1);
    clogData('firstAmountMin:', firstAmountMin);
    const secondAmountMin = new BigNumber(secondTokenAmount)
      .minus(new BigNumber(secondTokenAmount).times(slippage))
      .toFixed(0, 1);
    clogData('secondAmountMin:', secondAmountMin);
    clogData('lpAmount:', liquidity);
    if (tokenA && tokenB) {
      return router
        .removeLiquidity(
          tokenA,
          tokenB,
          liquidity,
          firstAmountMin,
          secondAmountMin,
          to,
          deadlineUTC,
        )
        .send({ shouldPollResponse: true });
    }
    if (tokenA === '') {
      return router
        .removeLiquidityTRXSupportingFeeOnTransferTokens(
          tokenB,
          liquidity,
          secondAmountMin,
          firstAmountMin,
          to,
          deadlineUTC,
        )
        .send({ shouldPollResponse: true });
    }
    return router
      .removeLiquidityTRXSupportingFeeOnTransferTokens(
        tokenA,
        liquidity,
        firstAmountMin,
        secondAmountMin,
        to,
        deadlineUTC,
      )
      .send({ shouldPollResponse: true });
  }

  public async swap(
    tokenInAddress: string,
    tokenOutAddress: string,
    isIn: boolean,
    amountIn: number,
    amountOut: number,
    path: string[],
    slippage: number,
    to: string,
    deadline: number,
  ): Promise<any> {
    try {
      const { contract, type } = contracts;
      const deadlineUTC = new BigNumber(Date.now() / 1000 + deadline).toFixed(0, 1);
      const router = await this.getContract(contract.ROUTER.chain[type].address);
      const decimalsIn = tokenInAddress ? await this.getDecimals(tokenInAddress) : 6;
      const decimalsOut = tokenOutAddress ? await this.getDecimals(tokenOutAddress) : 6;
      const allowance = tokenInAddress
        ? await this.checkAllowance(
            'token',
            rootStore.user.address,
            tokenInAddress,
            contract.ROUTER.chain[type].address,
          )
        : true;
      clogData('allowance:', allowance);
      if (!allowance) {
        try {
          await this.approveToken('token', tokenInAddress, contract.ROUTER.chain[type].address);
        } catch {
          const allowanceAfterApprove = await this.checkAllowance(
            'token',
            rootStore.user.address,
            tokenInAddress,
            contract.ROUTER.chain[type].address,
          );
          if (!allowanceAfterApprove) return Error('wrong approve token');
        }
      }
      if (isIn) {
        const amountOutMin = amountOut - amountOut * slippage;
        if (tokenInAddress && tokenOutAddress) {
          return router
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
              new BigNumber(amountIn).times(10 ** +decimalsIn).toFixed(0, 1),
              new BigNumber(amountOutMin).times(10 ** +decimalsOut).toFixed(0, 1),
              path,
              to,
              deadlineUTC,
            )
            .send({ shouldPollResponse: true });
        }
        if (tokenInAddress) {
          return router
            .swapExactTokensForTRXSupportingFeeOnTransferTokens(
              new BigNumber(amountIn).times(10 ** +decimalsIn).toFixed(0, 1),
              new BigNumber(amountOutMin).times(10 ** +decimalsOut).toFixed(0, 1),
              path,
              to,
              deadlineUTC,
            )
            .send({ shouldPollResponse: true });
        }
        return router
          .swapExactTRXForTokensSupportingFeeOnTransferTokens(
            new BigNumber(amountOutMin).times(10 ** +decimalsOut).toFixed(0, 1),
            path,
            to,
            deadlineUTC,
          )
          .send({
            callValue: new BigNumber(amountIn).times(10 ** +decimalsIn).toFixed(0, 1),
            shouldPollResponse: true,
          });
      }
      const amountInMax = amountIn + amountIn * slippage;
      if (tokenInAddress && tokenOutAddress) {
        return router
          .swapTokensForExactTokens(
            new BigNumber(amountOut).times(10 ** +decimalsOut).toFixed(0, 1),
            new BigNumber(amountInMax).times(10 ** +decimalsIn).toFixed(0, 1),
            path,
            to,
            deadlineUTC.toString(),
          )
          .send({ shouldPollResponse: true });
      }
      if (tokenInAddress) {
        return router
          .swapTokensForExactTRX(
            new BigNumber(amountOut).times(10 ** +decimalsOut).toFixed(0, 1),
            new BigNumber(amountInMax).times(10 ** +decimalsIn).toFixed(0, 1),
            path,
            to,
            deadlineUTC.toString(),
          )
          .send({ shouldPollResponse: true });
      }
      return router
        .swapTRXForExactTokens(
          new BigNumber(amountOut).times(10 ** +decimalsOut).toFixed(0, 1),
          path,
          to,
          deadlineUTC.toString(),
        )
        .send({
          callValue: new BigNumber(amountIn).times(10 ** +decimalsIn).toFixed(0, 1),
          shouldPollResponse: true,
        });
    } catch (e: any) {
      rootStore.modals.info.setMsg('Something went wrong', 'error');
      clogData('swap', e);
      return Error(e);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public prepareTransaction(wallet: any | string, transaction: any | string): void {
    transaction.action(wallet);
  }

  // eslint-disable-next-line class-methods-use-this
  async sendRawTx(tx: string): Promise<any> {
    return window.tronWeb.trx.sendRawTransaction(tx);
  }

  // async addToken() {
  //   try {
  //     const wasAdded = await this.wallet.request({
  //       method: "wallet_watchAsset",
  //       params: {
  //         type: "ERC20",
  //         options: {
  //           address: ContractDetails['TAMPA'].ADDRESS,
  //           symbol: ContractDetails['TAMPA'].SYMBOL,
  //           decimals: ContractDetails['TAMPA'].DECIMALS,
  //         },
  //       },
  //     });
  //     if (wasAdded) {
  //       console.log("Complete");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  render(): any {
    return (
      <walletConnectContext.Provider
        value={{
          connectorService: this,
        }}
      >
        {this.props.children}
      </walletConnectContext.Provider>
    );
  }
}

export default withRouter(TronLinkService);

export function useTronLinkService(): any {
  return useContext(walletConnectContext);
}
