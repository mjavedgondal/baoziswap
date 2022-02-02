import React, { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';

import ArrowDown from '../../assets/icons/arrow-down-black.svg';
import SettingsIcon from '../../assets/icons/form/settings.svg';
import { contracts } from '../../config';
import { tokenList } from '../../config/tokens';
import { useTronLinkService } from '../../services/web3';
import { useMst } from '../../store/store';
import { clogData } from '../../utils/logger';
import { Button } from '../index';

import './AddLiquidity.scss';

const AddLiquidity: React.FC = observer(() => {
  const { modals, user } = useMst();
  const [firstToken, setFirstToken] = useState(tokenList[user.tokenIndex.first]);
  const [secondToken, setSecondToken] = useState(tokenList[user.tokenIndex.second]);
  const [firstInput, setFirstInput] = useState('');
  const [secondInput, setSecondInput] = useState('');
  const [firstBalance, setFirstBalance] = useState('0');
  const [secondBalance, setSecondBalance] = useState('0');
  const [firstInputError, setFirstInputError] = useState('');
  const [secondInputError, setSecondInputError] = useState('');
  const [prices, setPrices] = useState({ first: '0', second: '0' });
  const [shareOfPool, setShareOfPool] = useState(0);
  const [isLoadingFirstApprove, setLoadingFirstApprove] = useState(false);
  const [isLoadingSecondApprove, setLoadingSecondApprove] = useState(false);
  const [isFirstApproved, setFirstApproved] = useState(false);
  const [isSecondApproved, setSecondApproved] = useState(false);
  const [isSupplyLoading, setSupplyLoading] = useState(false);
  const { contract, type } = contracts;
  const connector = useTronLinkService().connectorService;
  const firstTokenSelected = [...tokenList, ...user.importedTokens][user.tokenIndex.first];
  const secondTokenSelected = [...tokenList, ...user.importedTokens][user.tokenIndex.second];

  const getPoolData = useCallback(async () => {
    try {
      const WTRX = await connector.getTRXAddress();
      const pairAddress = await connector.getPairAddress(
        [...tokenList, ...user.importedTokens][user.tokenIndex.first].address,
        [...tokenList, ...user.importedTokens][user.tokenIndex.second].address,
      );
      const pair =
        (await connector.getContract(pairAddress, contract.PAIR.chain[type].abi)) ?? undefined;
      const token0 = window.tronWeb.address.fromHex(
        await pair.token0().call({ _isConstant: true }),
      );
      clogData('token0:', token0);
      const token1 = window.tronWeb.address.fromHex(
        await pair.token1().call({ _isConstant: true }),
      );
      clogData('token1:', token1);
      [...tokenList, ...user.importedTokens].forEach((token) => {
        if ((token.address || WTRX) === token0) setFirstToken(token);
        if ((token.address || WTRX) === token1) setSecondToken(token);
      });
      const decimals0 = await connector.getDecimals(token0);
      const decimals1 = await connector.getDecimals(token1);
      const reserves = await pair.getReserves().call({ _isConstant: true });
      const totalSupply = await pair.totalSupply().call({ _isConstant: true });
      const balanceOf = await pair.balanceOf(user?.address).call({ _isConstant: true });
      // eslint-disable-next-line no-underscore-dangle
      const reserve0 = new BigNumber(reserves._reserve0._hex)
        .dividedBy(10 ** +decimals0)
        .toString(10);
      clogData('reserve0:', reserve0);
      // eslint-disable-next-line no-underscore-dangle
      const reserve1 = new BigNumber(reserves._reserve1._hex)
        .dividedBy(10 ** +decimals1)
        .toString(10);
      clogData('reserve1:', reserve1);
      // eslint-disable-next-line no-underscore-dangle
      const total = new BigNumber(totalSupply._hex).toFixed(0, 1);
      // eslint-disable-next-line no-underscore-dangle
      const balance = new BigNumber(balanceOf._hex).plus(1000).toFixed(0, 1);
      if (+reserve0 && +reserve1) {
        if ((firstTokenSelected.address || WTRX) === token0) {
          setPrices({
            first: new BigNumber(reserve0).dividedBy(reserve1).toString(10),
            second: new BigNumber(reserve1).dividedBy(reserve0).toString(10),
          });
        } else {
          setPrices({
            first: new BigNumber(reserve1).dividedBy(reserve0).toString(10),
            second: new BigNumber(reserve0).dividedBy(reserve1).toString(10),
          });
        }
      }
      setShareOfPool(+new BigNumber(balance).dividedBy(total).times(100).toFixed(0, 1));
      setFirstInput('');
      setSecondInput('');
    } catch (e: any) {
      clogData('getPoolData', e);
      setFirstInput('');
      setSecondInput('');
      setPrices({
        first: '0',
        second: '0',
      });
      setShareOfPool(0);
    }
  }, [
    connector,
    contract.PAIR.chain,
    firstTokenSelected.address,
    type,
    user.address,
    user.importedTokens,
    user.tokenIndex.first,
    user.tokenIndex.second,
  ]);

  const getBalances = useCallback(async () => {
    const balanceA = firstTokenSelected.address
      ? await connector.getTokenBalance(firstTokenSelected.address, user.address)
      : await connector.getBalance(user.address);
    const balanceB = secondTokenSelected.address
      ? await connector.getTokenBalance(secondTokenSelected.address, user.address)
      : await connector.getBalance(user.address);
    if (firstTokenSelected.address) {
      const isApproved = await connector.checkAllowance(
        'token',
        user.address,
        firstTokenSelected.address,
        contract.ROUTER.chain[type].address,
      );
      setFirstApproved(isApproved);
    }
    if (secondTokenSelected.address) {
      const isApproved = await connector.checkAllowance(
        'token',
        user.address,
        secondTokenSelected.address,
        contract.ROUTER.chain[type].address,
      );
      setSecondApproved(isApproved);
    }
    setFirstBalance(
      new BigNumber(balanceA).dividedBy(10 ** firstTokenSelected.decimals).toString(10),
    );
    setSecondBalance(
      new BigNumber(balanceB).dividedBy(10 ** secondTokenSelected.decimals).toString(10),
    );
  }, [
    connector,
    contract.ROUTER.chain,
    firstTokenSelected.address,
    firstTokenSelected.decimals,
    secondTokenSelected.address,
    secondTokenSelected.decimals,
    type,
    user.address,
  ]);

  const handleChangeInput = (e: any, token: 'first' | 'second') => {
    if (!isSupplyLoading) {
      if (e.target.value[0] === '.') {
        if (token === 'first') setFirstInput(`0${e.target.value}`);
        else setSecondInput(`0${e.target.value}`);
      } else if (!Number.isNaN(+e.target.value)) {
        if (token === 'first') {
          setFirstInput(e.target.value);
          if (prices.second !== '0') {
            setSecondInput(new BigNumber(+e.target.value * +prices.second).toString(10));
          }
        } else {
          setSecondInput(e.target.value);
          if (prices.first !== '0') {
            setFirstInput(new BigNumber(+e.target.value * +prices.first).toString(10));
          }
        }
      }
    }
  };

  const setMax = (token: 'first' | 'second') => {
    if (!isSupplyLoading) {
      if (token === 'first') {
        setFirstInput(firstBalance);
        if (prices.second !== '0') {
          setSecondInput(new BigNumber(firstBalance).times(prices.second).toString(10));
        }
      } else {
        setSecondInput(secondBalance);
        if (prices.first !== '0') {
          setFirstInput(new BigNumber(secondBalance).times(prices.first).toString(10));
        }
      }
    }
  };

  const handleApprove = async (query: number) => {
    if (!isSupplyLoading) {
      try {
        if (query === 1) {
          if (!isLoadingFirstApprove && !isFirstApproved) {
            setLoadingFirstApprove(true);
            await connector.approveToken(
              'token',
              firstTokenSelected.address,
              contract.ROUTER.chain[type].address,
            );
            modals.info.setMsg(
              `You have successfully approved amount of ${firstTokenSelected.symbol}`,
              'success',
            );
            setFirstApproved(true);
            setLoadingFirstApprove(false);
          }
        } else if (!isLoadingSecondApprove && !isSecondApproved) {
          setLoadingSecondApprove(true);
          await connector.approveToken(
            'token',
            secondTokenSelected.address,
            contract.ROUTER.chain[type].address,
          );
          modals.info.setMsg(
            `You have successfully approved amount of ${secondTokenSelected.symbol}`,
            'success',
          );
          setSecondApproved(true);
          setLoadingSecondApprove(false);
        }
      } catch (err: any) {
        if (err?.error) {
          clogData('approve error:', err);
        } else clogData('approve', err);
        if (err?.transaction) {
          const isApproved = await connector.checkAllowance(
            'token',
            user.address,
            query === 1 ? firstTokenSelected.address : secondTokenSelected.address,
            contract.ROUTER.chain[type].address,
          );
          if (isApproved) {
            modals.info.setMsg(
              `You have successfully approved ${
                query === 1 ? firstTokenSelected.name : secondTokenSelected.name
              }`,
              'success',
            );
            // eslint-disable-next-line no-unused-expressions
            query === 1 ? setFirstApproved(true) : setSecondApproved(true);
          } else modals.info.setMsg('Something went wrong', 'error');
        }
        if (query === 1) {
          setLoadingFirstApprove(false);
        } else setLoadingSecondApprove(false);
      }
    }
  };

  const handleSupply = async () => {
    if (
      !isSupplyLoading &&
      (isFirstApproved || firstTokenSelected.address === '') &&
      (isSecondApproved || secondTokenSelected.address === '') &&
      firstInput &&
      secondInput &&
      !firstInputError &&
      !secondInputError
    ) {
      setSupplyLoading(true);
      const deadline = modals.options.deadline ? +modals.options.deadline * 60 : 1800;
      const deadlineUTC = new BigNumber(Date.now() / 1000 + deadline).toFixed(0, 1);
      const slippage = modals.options.slippage ? +modals.options.slippage / 100 : 5 / 1000;
      const minFirstTokenAmount = new BigNumber(firstInput)
        .minus(new BigNumber(firstInput).times(slippage))
        .toString(10);
      const minSecondTokenAmount = new BigNumber(secondInput)
        .minus(new BigNumber(secondInput).times(slippage))
        .toString(10);
      try {
        await connector.addLiquidity(
          firstTokenSelected.address,
          secondTokenSelected.address,
          firstInput,
          secondInput,
          minFirstTokenAmount,
          minSecondTokenAmount,
          user.address,
          deadlineUTC,
        );
        modals.info.setMsg(
          `You have successfully added liquidity to pool
          ${firstToken.symbol}/${secondToken.symbol}`,
          'success',
        );
        setSupplyLoading(false);
        setTimeout(() => {
          window.location.href = '/pool';
        }, 2000);
      } catch (err: any) {
        clogData('addLiquidity error:', err);
        if (err?.error && err?.transaction) {
          modals.info.setMsg(err.error, 'error', err.transaction.txID);
        } else modals.info.setMsg('Something went wrong', 'error');
        setSupplyLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user.address) {
      getBalances();
      getPoolData();
    }
  }, [getBalances, getPoolData, user.address]);

  useEffect(() => {
    if (+firstInput <= 0) {
      setFirstInputError('value should be greater then 0');
    } else if (+firstInput > +firstBalance) {
      setFirstInputError("value can't be greater then your balance");
    } else setFirstInputError('');
    if (+secondInput <= 0) {
      setSecondInputError('value should be greater then 0');
    } else if (+secondInput > +secondBalance) {
      setSecondInputError("value can't be greater then your balance");
    } else setSecondInputError('');
  }, [firstBalance, firstInput, secondBalance, secondInput]);

  return (
    <div className="liquidity-add">
      <div className="liquidity-add__header">
        Add liquidity
        <Button onClick={modals.options.open} className="liquidity-add__header__options">
          <img src={SettingsIcon} alt="settings icon" />
        </Button>
      </div>
      <div className="liquidity-add__box">
        <div className="liquidity-add__box__input">
          <input
            type="text"
            value={firstInput}
            placeholder="0.0"
            onChange={(e: any) => handleChangeInput(e, 'first')}
          />
          <Button
            onClick={() => {
              modals.tokenSelect.open(true);
            }}
            className="shadow-btn"
          >
            <img
              className="shadow-btn__logo"
              src={firstTokenSelected.logo}
              alt={firstTokenSelected.name}
            />
            {firstTokenSelected.symbol}
            <img src={ArrowDown} alt="arrow down black" />
          </Button>
        </div>
        {firstInputError ? <div className="liquidity-add__box__error">{firstInputError}</div> : ''}
        <div className="liquidity-add__box__balance">
          Balance: {new BigNumber(firstBalance).toFixed(5, 1)} {firstTokenSelected.symbol}
          <Button onClick={() => setMax('first')} className="liquidity-add__box__balance__max">
            MAX
          </Button>
        </div>
      </div>
      <div className="liquidity-add__plus">+</div>
      <div className="liquidity-add__box">
        <div className="liquidity-add__box__input">
          <input
            type="text"
            value={secondInput}
            placeholder="0.0"
            onChange={(e) => handleChangeInput(e, 'second')}
          />
          <Button
            onClick={() => {
              modals.tokenSelect.open(false);
            }}
            className="shadow-btn"
          >
            <img
              className="shadow-btn__logo"
              src={secondTokenSelected.logo}
              alt={secondTokenSelected.name}
            />
            {secondTokenSelected.symbol}
            <img src={ArrowDown} alt="arrow down black" />
          </Button>
        </div>
        {secondInputError ? (
          <div className="liquidity-add__box__error">{secondInputError}</div>
        ) : (
          ''
        )}
        <div className="liquidity-add__box__balance">
          Balance: {new BigNumber(secondBalance).toFixed(5, 1)} {secondTokenSelected.symbol}
          <Button onClick={() => setMax('second')} className="liquidity-add__box__balance__max">
            MAX
          </Button>
        </div>
      </div>
      <div className="liquidity-add__box pair-info">
        <div className="liquidity-add__box__title">Initial prices and pool share</div>
        <div className="liquidity-add__box__info">
          <div className="liquidity-add__box__info__item">
            <div
              className="liquidity-add__box__info__item__value"
              title={new BigNumber(prices.second).toString(10)}
            >
              {new BigNumber(prices.second).toFixed(5, 1)}
            </div>
            <div className="liquidity-add__box__info__item__name">
              {firstTokenSelected.symbol} per {secondTokenSelected.symbol}
            </div>
          </div>
          <div className="liquidity-add__box__info__item">
            <div
              className="liquidity-add__box__info__item__value"
              title={new BigNumber(prices.first).toString(10)}
            >
              {new BigNumber(prices.first).toFixed(5, 1)}
            </div>
            <div className="liquidity-add__box__info__item__name">
              {secondTokenSelected.symbol} per {firstTokenSelected.symbol}
            </div>
          </div>
          <div className="liquidity-add__box__info__item">
            <div className="liquidity-add__box__info__item__value">{shareOfPool}%</div>
            <div className="liquidity-add__box__info__item__name">Share of Pool</div>
          </div>
        </div>
      </div>
      <div className="liquidity-add__approves">
        <Button
          onClick={() => {
            return isFirstApproved || firstTokenSelected.address === '' ? {} : handleApprove(1);
          }}
          className={`yellow-btn ${
            isFirstApproved || firstTokenSelected.address === '' ? 'disabled' : ''
          }`}
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isFirstApproved || firstTokenSelected.address === ''
            ? 'approved'
            : isLoadingFirstApprove
            ? 'wait...'
            : `approve ${firstTokenSelected.symbol}`}
        </Button>
        <Button
          onClick={() => {
            return isSecondApproved || secondTokenSelected.address === '' ? {} : handleApprove(2);
          }}
          className={`yellow-btn ${
            isSecondApproved || secondTokenSelected.address === '' ? 'disabled' : ''
          }`}
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isSecondApproved || secondTokenSelected.address === ''
            ? 'approved'
            : isLoadingSecondApprove
            ? 'wait...'
            : `approve ${secondTokenSelected.symbol}`}
        </Button>
      </div>
      <Button
        onClick={handleSupply}
        className={`liquidity-add__supply brown-btn ${
          (isFirstApproved || firstTokenSelected.address === '') &&
          (isSecondApproved || secondTokenSelected.address === '') &&
          !firstInputError &&
          !secondInputError &&
          firstInput &&
          secondInput
            ? ''
            : 'disabled'
        }`}
      >
        {isSupplyLoading ? 'In progress...' : 'Supply'}
      </Button>
    </div>
  );
});

export default AddLiquidity;
