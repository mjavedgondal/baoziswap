import React, { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js/bignumber';
import { observer } from 'mobx-react';

import IconArrowDownBlack from '../../assets/icons/arrow-down-black.svg';
import IconArrowDownWhite from '../../assets/icons/arrow-down-white.svg';
import IconSettings from '../../assets/icons/form/settings.svg';
import IconSwap from '../../assets/icons/form/swap.svg';
import { contracts } from '../../config';
import { tokenList } from '../../config/tokens';
import { connectTron } from '../../services/connectWallet';
import { useTronLinkService } from '../../services/web3';
import { useMst } from '../../store/store';
import { TypeToken } from '../../types';
import { clogData } from '../../utils/logger';
import { findPath } from '../../utils/pathFinder';
import { Button } from '../index';

import './SwapForm.scss';

const SwapForm: React.FC = observer(() => {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [firstSwap, setFirstSwap] = useState<string>('');
  const [secondSwap, setSecondSwap] = useState<string>('');
  const [firstSwapError, setFirstSwapError] = useState<string>('');
  const [secondSwapError, setSecondSwapError] = useState<string>('');
  const [firstTokenReserve, setFirstTokenReserve] = useState<string>('');
  const [secondTokenReserve, setSecondTokenReserve] = useState<string>('');
  const [firstBalance, setFirstBalance] = useState<string>('0');
  const [secondBalance, setSecondBalance] = useState<string>('0');
  const [isTypedAmountIn, setTypedAmountIn] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [priceImpact, setPriceImpact] = useState<string>('');
  const connector = useTronLinkService().connectorService;
  const { contract, type } = contracts;
  const { modals, user } = useMst();
  const allTokens: TypeToken[] = [...tokenList, ...user.importedTokens];
  const firstToken: TypeToken = allTokens[user.tokenIndex.first];
  const secondToken: TypeToken = allTokens[user.tokenIndex.second];
  const WTRX = contract.WTRX.chain[type].address;

  clogData('firstReserve:', firstTokenReserve);
  clogData('secondReserve:', secondTokenReserve);

  const handleSelectToken = (isIn: boolean) => {
    if (!isLoading) {
      modals.tokenSelect.open(isIn);
    }
  };

  const handleInput = async (e: any, isIn: boolean, setValue: (arg0: string) => void) => {
    if (!isLoading) {
      if (!Number.isNaN(+e.target.value) || e.target.value === '.') {
        setValue(e.target.value[0] === '.' ? `0${e.target.value}` : e.target.value);
        setTypedAmountIn(isIn);
      }
      if (e.target.value === '') {
        setValue(e.target.value);
        if (isIn) {
          setSecondSwap(e.target.value);
        } else setFirstSwap(e.target.value);
      }
    }
  };

  const setMax = (query: number) => {
    if (query === 1) {
      setFirstSwap(firstBalance);
      setTypedAmountIn(true);
    } else {
      setSecondSwap(secondBalance);
      setTypedAmountIn(false);
    }
  };

  const handleReplace = () => {
    if (!isLoading) {
      if (secondToken.name) {
        const swap = firstSwap;
        const index = user.tokenIndex.first;
        user.setFirstIndex(user.tokenIndex.second);
        user.setSecondIndex(index);
        setFirstSwap(secondSwap);
        setSecondSwap(swap);
      }
    }
  };

  const handleSwap = async () => {
    if (
      !isLoading &&
      !firstSwapError &&
      !secondSwapError &&
      firstSwap &&
      secondSwap &&
      currentPath.length > 1
    ) {
      try {
        setLoading(true);
        const deadline = modals.options.deadline ? +modals.options.deadline * 60 : 1800;
        const slippage = modals.options.slippage ? +modals.options.slippage / 100 : 5 / 1000;
        const res = await connector.swap(
          firstToken.address,
          secondToken.address,
          isTypedAmountIn,
          +firstSwap,
          +secondSwap,
          currentPath,
          slippage,
          user.address,
          deadline,
        );
        modals.info.setMsg(
          `Congrats you have successfully swap ${firstToken.symbol} to ${secondToken.symbol}`,
          'success',
        );
        clogData('swap res:', res);
        setLoading(false);
        setFirstSwap('');
        setSecondSwap('');
      } catch (err: any) {
        if (err?.error && err?.transaction) {
          modals.info.setMsg(err.error, 'error', err.transaction.txID);
        } else modals.info.setMsg('Something went wrong', 'error');
        clogData('swap error:', err);
        setLoading(false);
        setFirstSwap('');
        setSecondSwap('');
      }
    }
  };

  const getBalances = useCallback(async () => {
    try {
      let secondTokenBalance = '0';
      const firstTokenDecimals = firstToken.address
        ? await connector.getDecimals(firstToken.address)
        : 6;
      const firstTokenBalance = firstToken.address
        ? await connector.getTokenBalance(firstToken.address, user.address)
        : await connector.getBalance(user.address);
      if (secondToken.symbol) {
        const secondTokenDecimals = secondToken.address
          ? await connector.getDecimals(secondToken.address)
          : 6;
        secondTokenBalance = secondToken.address
          ? await connector.getTokenBalance(secondToken.address, user.address)
          : await connector.getBalance(user.address);
        setSecondBalance(
          secondTokenBalance === '0'
            ? secondTokenBalance
            : new BigNumber(secondTokenBalance).dividedBy(10 ** secondTokenDecimals).toFixed(5, 1),
        );
      }
      setFirstBalance(
        firstTokenBalance === '0'
          ? firstTokenBalance
          : new BigNumber(firstTokenBalance).dividedBy(10 ** firstTokenDecimals).toFixed(5, 1),
      );
    } catch (e: any) {
      clogData('getBalances error:', e);
      setFirstBalance('0');
      setSecondBalance('0');
    }
  }, [connector, firstToken.address, secondToken.address, secondToken.symbol, user.address]);

  const getReserves = useCallback(async () => {
    try {
      const pair = await connector.getPairAddress(firstToken.address, secondToken.address);
      if (window.tronWeb.address.fromHex(pair) === 'TY6XSJTKSb4nym3iCzxQAWtDYAhjTGxqWZ')
        modals.info.setMsg(
          'For successful swap of these tokens, we recommend setting a slippage of 20%',
          'error',
        );
      const pairContract = await connector.getContract(pair, contract.PAIR.chain[type].abi);
      const reserves = await pairContract.getReserves().call({ _isConstant: true });
      // eslint-disable-next-line no-underscore-dangle
      const reserve0 = new BigNumber(reserves._reserve0._hex).toString(10);
      // eslint-disable-next-line no-underscore-dangle
      const reserve1 = new BigNumber(reserves._reserve1._hex).toString(10);
      const token0 = window.tronWeb.address.fromHex(
        await pairContract.token0().call({ _isConstant: true }),
      );
      if (token0 === (firstToken.address || WTRX)) {
        setFirstTokenReserve(reserve0);
        setSecondTokenReserve(reserve1);
      } else {
        setFirstTokenReserve(reserve1);
        setSecondTokenReserve(reserve0);
      }
      setCurrentPath([firstToken.address || WTRX, secondToken.address || WTRX]);
    } catch (e) {
      const path = await findPath(firstToken.address || WTRX, secondToken.address || WTRX);
      setCurrentPath(path);
      setFirstTokenReserve('');
      setSecondTokenReserve('');
    }
  }, [
    WTRX,
    connector,
    contract.PAIR.chain,
    firstToken.address,
    modals.info,
    secondToken.address,
    type,
  ]);

  const getAmount = useCallback(async () => {
    try {
      const amountIn = new BigNumber(firstSwap).times(10 ** firstToken.decimals).toFixed(0, 1);
      const amountOut = new BigNumber(secondSwap).times(10 ** secondToken.decimals).toFixed(0, 1);
      if (+firstTokenReserve && +secondTokenReserve) {
        if (isTypedAmountIn && +amountIn) {
          const res = await connector.getAmountOut(amountIn, firstTokenReserve, secondTokenReserve);
          clogData('amountOut res:', res);
          // eslint-disable-next-line no-underscore-dangle
          if (res.amountOut?._hex) {
            setSecondSwapError('');
            setSecondSwap(
              // eslint-disable-next-line no-underscore-dangle
              new BigNumber(res.amountOut._hex).dividedBy(10 ** secondToken.decimals).toString(10),
            );
            // eslint-disable-next-line no-underscore-dangle
          } else if (res._hex) {
            setSecondSwapError('');
            setSecondSwap(
              // eslint-disable-next-line no-underscore-dangle
              new BigNumber(res._hex).dividedBy(10 ** secondToken.decimals).toString(10),
            );
          } else setSecondSwapError('cannot get amount');
        } else if (!isTypedAmountIn && +amountOut) {
          const res = await connector.getAmountIn(amountOut, firstTokenReserve, secondTokenReserve);
          clogData('amountIn res:', res);
          // eslint-disable-next-line no-underscore-dangle
          if (res.amountIn?._hex) {
            setFirstSwapError('');
            setFirstSwap(
              // eslint-disable-next-line no-underscore-dangle
              new BigNumber(res.amountIn._hex).dividedBy(10 ** firstToken.decimals).toString(10),
            );
            // eslint-disable-next-line no-underscore-dangle
          } else if (res._hex) {
            setFirstSwapError('');
            setFirstSwap(
              // eslint-disable-next-line no-underscore-dangle
              new BigNumber(res._hex).dividedBy(10 ** firstToken.decimals).toString(10),
            );
          } else setFirstSwapError('cannot get amount');
        }
      } else if (modals.options.multihops) {
        if (isTypedAmountIn && +amountIn) {
          let amount: string;
          const res = await connector.getAmountsOut(amountIn, currentPath);
          clogData('getAmountsOut res:', res);
          setSecondSwapError('');
          if (res.amounts?.length) {
            // eslint-disable-next-line no-underscore-dangle
            amount = new BigNumber(res.amounts[res.amounts.length - 1]._hex)
              .dividedBy(10 ** secondToken.decimals)
              .toString(10);
          } else {
            // eslint-disable-next-line no-underscore-dangle
            amount = new BigNumber(res[res.length - 1]._hex)
              .dividedBy(10 ** secondToken.decimals)
              .toString(10);
          }
          setSecondSwap(amount);
        } else if (!isTypedAmountIn && +amountOut) {
          let amount: string;
          const res = await connector.getAmountsIn(amountOut, currentPath);
          clogData('getAmountsIn res:', res);
          setFirstSwapError('');
          if (res.amounts?.length) {
            // eslint-disable-next-line no-underscore-dangle
            amount = new BigNumber(res.amounts[0]._hex)
              .dividedBy(10 ** firstToken.decimals)
              .toString(10);
          } else {
            // eslint-disable-next-line no-underscore-dangle
            amount = new BigNumber(res[0]._hex).dividedBy(10 ** firstToken.decimals).toString(10);
          }
          setFirstSwap(amount);
        }
      }
    } catch (e: any) {
      if (isTypedAmountIn) {
        setFirstSwapError('something went wrong, try another value');
      } else setSecondSwapError('something went wrong, try another value');
      clogData('getAmount error:', e);
    }
  }, [
    connector,
    currentPath,
    firstSwap,
    firstToken.decimals,
    firstTokenReserve,
    isTypedAmountIn,
    modals.options.multihops,
    secondSwap,
    secondToken.decimals,
    secondTokenReserve,
  ]);

  const getPriceImpact = useCallback(async () => {
    if (+firstTokenReserve && +secondTokenReserve && +firstSwap && +secondSwap) {
      const currentPrice = new BigNumber(firstTokenReserve).div(secondTokenReserve).toString(10);
      clogData('currentPrice:', currentPrice);
      const newPrice = new BigNumber(firstTokenReserve)
        .plus(new BigNumber(firstSwap).times(10 ** firstToken.decimals))
        .div(
          new BigNumber(secondTokenReserve).minus(
            new BigNumber(secondSwap).times(10 ** secondToken.decimals),
          ),
        )
        .toString(10);
      clogData('newPrice:', newPrice);
      const impact = new BigNumber(newPrice)
        .minus(currentPrice)
        .div(currentPrice)
        .times(100)
        .toString(10);
      setPriceImpact(impact);
    } else setPriceImpact('');
  }, [
    firstSwap,
    firstToken.decimals,
    firstTokenReserve,
    secondSwap,
    secondToken.decimals,
    secondTokenReserve,
  ]);

  useEffect(() => {
    if (user.address) {
      getBalances();
      getReserves();
    }
  }, [getBalances, getReserves, user.address]);

  useEffect(() => {
    getPriceImpact();
  }, [getPriceImpact]);

  useEffect(() => {
    if (isTypedAmountIn && firstSwap) {
      if (+firstSwap <= 0) {
        setFirstSwapError('value should be greater then 0');
        setSecondSwap('');
      } else if (+firstSwap > +firstBalance) {
        setFirstSwapError("value can't be greater then your balance");
        getAmount();
      } else {
        setFirstSwapError('');
        getAmount();
      }
    } else if (!isTypedAmountIn && secondSwap) {
      if (+secondSwap <= 0) {
        setSecondSwapError('value should be greater then 0');
        setFirstSwap('');
      } else if (+secondSwap > +secondBalance) {
        setSecondSwapError("value can't be greater then your balance");
        getAmount();
      } else {
        setSecondSwapError('');
        getAmount();
      }
    } else {
      // eslint-disable-next-line no-unused-expressions
      isTypedAmountIn ? setSecondSwap('') : setFirstSwap('');
    }
  }, [firstBalance, firstSwap, getAmount, isTypedAmountIn, secondBalance, secondSwap]);

  return (
    <div className="swap-form">
      <div className="swap-form__header">
        <div className="swap-form__header__title">SWAP</div>
        <Button className="swap-form__header__settings" onClick={() => modals.options.open()}>
          <img src={IconSettings} alt="settings icon" />
        </Button>
      </div>
      <div className="swap-form__inputs">
        <div className="swap-form__inputs__item">
          <div className="swap-form__inputs__item__row">
            <input
              type="text"
              value={firstSwap}
              placeholder="0.0"
              onChange={(event) => handleInput(event, true, setFirstSwap)}
            />
            <Button className="select select__btn" onClick={() => handleSelectToken(true)}>
              <img className="select__img" src={firstToken.logo} alt="select item" />
              <div className="select__text">{firstToken.symbol}</div>
              <img className="select__arrow" src={IconArrowDownBlack} alt="arrow down black" />
            </Button>
          </div>
          <div className="swap-form__inputs__item__balance">
            Balance: {firstBalance} {firstToken.symbol}
            <Button className="swap-form__inputs__item__balance__max" onClick={() => setMax(1)}>
              MAX
            </Button>
          </div>
          <div className="swap-form__inputs__item__error">{firstSwapError}</div>
        </div>
        <Button className="swap-form__inputs__swap" onClick={handleReplace}>
          <img src={IconSwap} alt="swap icon" />
        </Button>
        <div className="swap-form__inputs__item">
          <div className="swap-form__inputs__item__row">
            <input
              type="text"
              value={secondSwap}
              placeholder="0.0"
              onChange={(event) => handleInput(event, false, setSecondSwap)}
            />
            {secondToken.name !== '' ? (
              <Button className="select select__btn" onClick={() => handleSelectToken(false)}>
                <img className="select__img" src={secondToken.logo} alt="select item" />
                <div className="select__text">{secondToken.symbol}</div>
                <img className="select__arrow" src={IconArrowDownBlack} alt="arrow down black" />
              </Button>
            ) : (
              <Button
                className="select select__btn-yellow"
                onClick={() => handleSelectToken(false)}
              >
                <div className="select__text">Select a currency</div>
                <img className="select__arrow" src={IconArrowDownWhite} alt="arrow down white" />
              </Button>
            )}
          </div>
          <div className="swap-form__inputs__item__balance">
            Balance: {secondBalance} {secondToken.symbol}
            <Button className="swap-form__inputs__item__balance__max" onClick={() => setMax(2)}>
              MAX
            </Button>
          </div>
          <div className="swap-form__inputs__item__error">{secondSwapError}</div>
        </div>
      </div>
      {priceImpact ? (
        <div className="swap-form__impact" title={new BigNumber(priceImpact).toString(10)}>
          Price impact: {new BigNumber(priceImpact).toFixed(2, 1)}%
        </div>
      ) : (
        ''
      )}
      <Button
        className={`swap-form__button brown-btn ${
          firstSwap && secondSwap && !firstSwapError && !secondSwapError && currentPath.length
            ? ''
            : 'disabled'
        }`}
        onClick={user.address ? handleSwap : connectTron}
      >
        {isLoading ? (
          <span>In progress...</span>
        ) : (
          <span>
            {/* eslint-disable-next-line no-nested-ternary */}
            {user.address ? (currentPath.length ? 'SWAP' : 'No pair to swap') : 'Connect wallet'}
          </span>
        )}
      </Button>
    </div>
  );
});

export default SwapForm;
