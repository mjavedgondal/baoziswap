import React, { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';

import ArrowBlack from '../../assets/icons/arrow-black.svg';
import OptionsImg from '../../assets/icons/form/settings.svg';
import { contracts } from '../../config';
import { tokenList } from '../../config/tokens';
import { useTronLinkService } from '../../services/web3';
import { useMst } from '../../store/store';
import { TypeToken } from '../../types';
import { clogData } from '../../utils/logger';
import { Button } from '..';

import './RemoveLiquidity.scss';

const RemoveLiquidity: React.FC = observer(() => {
  const [isLoading, setLoading] = useState(false);
  const [isApproved, setApproved] = useState(false);
  const [firstToken, setFirstToken] = useState({} as TypeToken);
  const [secondToken, setSecondToken] = useState({} as TypeToken);
  const [lpAmountError, setLpAmountError] = useState('');
  const [isSimple, setSimple] = useState(false);
  const [percent, setPercent] = useState(0);
  const [lpBalance, setLpBalance] = useState('');
  const [decimals, setDecimals] = useState({ first: 0, second: 0, lp: 0 });
  const [shareOfPool, setShareOfPool] = useState(0);
  const [prices, setPrices] = useState({ first: 1, second: 1 });
  const [yourReserves, setYourReserves] = useState({ first: '0', second: '0' });
  const [lpAmount, setLpAmount] = useState('');
  const [firstTokenAmount, setFirstTokenAmount] = useState('');
  const [secondTokenAmount, setSecondTokenAmount] = useState('');
  const { modals, user } = useMst();
  const { contract, type } = contracts;
  const connector = useTronLinkService().connectorService;
  const WTRX = contract.WTRX.chain[type].address;

  clogData('lpBalance:', lpBalance);
  clogData('shareOfPool:', shareOfPool);
  clogData('firstTokenAmount:', firstTokenAmount);
  clogData('secondTokenAmount:', secondTokenAmount);
  clogData('lpAmount:', lpAmount);

  const handleSetPercent = (amount: number) => {
    if (!isLoading) {
      if (!Number.isNaN(amount) && amount >= 0 && amount <= 100) {
        setPercent(amount);
        const inputPercent = amount / 100;
        setFirstTokenAmount(
          new BigNumber(yourReserves.first)
            .times(inputPercent)
            .dividedBy(10 ** decimals.first)
            .toString(10),
        );
        setSecondTokenAmount(
          new BigNumber(yourReserves.second)
            .times(inputPercent)
            .dividedBy(10 ** decimals.second)
            .toString(10),
        );
        setLpAmount(
          new BigNumber(lpBalance)
            .times(inputPercent)
            .dividedBy(10 ** decimals.lp)
            .toString(10),
        );
      }
    }
  };

  const setMax = async () => {
    if (!isLoading) {
      setPercent(100);
      setLpAmount(new BigNumber(lpBalance).dividedBy(10 ** decimals.lp).toString(10));
      setFirstTokenAmount(
        new BigNumber(yourReserves.first).dividedBy(10 ** decimals.first).toString(10),
      );
      setSecondTokenAmount(
        new BigNumber(yourReserves.second).dividedBy(10 ** decimals.second).toString(10),
      );
    }
  };

  const handleChangeAmount = (input: 'first' | 'second' | 'lp', e: any) => {
    if (!isLoading) {
      if (!Number.isNaN(+e.target.value)) {
        if (input === 'first') {
          const inputAmount = new BigNumber(e.target.value)
            .times(10 ** decimals.first)
            .toFixed(0, 1);
          const inputPercent = +new BigNumber(inputAmount)
            .dividedBy(new BigNumber(yourReserves.first))
            .toString(10);
          setFirstTokenAmount(e.target.value);
          setSecondTokenAmount(
            new BigNumber(yourReserves.second)
              .times(inputPercent)
              .dividedBy(10 ** decimals.second)
              .toString(10),
          );
          setLpAmount(
            new BigNumber(lpBalance)
              .times(inputPercent)
              .dividedBy(10 ** decimals.lp)
              .toString(10),
          );
          setPercent(Math.ceil(inputPercent * 100));
        } else if (input === 'second') {
          const inputAmount = new BigNumber(e.target.value)
            .times(10 ** decimals.second)
            .toFixed(0, 1);
          const inputPercent = +new BigNumber(inputAmount)
            .dividedBy(yourReserves.second)
            .toString(10);
          setSecondTokenAmount(e.target.value);
          setFirstTokenAmount(
            new BigNumber(yourReserves.first)
              .times(inputPercent)
              .dividedBy(10 ** decimals.first)
              .toString(10),
          );
          setLpAmount(
            new BigNumber(lpBalance)
              .times(inputPercent)
              .dividedBy(10 ** decimals.lp)
              .toString(10),
          );
          setPercent(Math.ceil(inputPercent * 100));
        } else {
          const inputAmount = new BigNumber(e.target.value).times(10 ** decimals.lp).toFixed(0, 1);
          const inputPercent = +new BigNumber(inputAmount).dividedBy(lpBalance).toString(10);
          setLpAmount(e.target.value);
          setFirstTokenAmount(
            new BigNumber(yourReserves.first)
              .times(inputPercent)
              .dividedBy(10 ** decimals.first)
              .toString(10),
          );
          setSecondTokenAmount(
            new BigNumber(yourReserves.second)
              .times(inputPercent)
              .dividedBy(10 ** decimals.second)
              .toString(10),
          );
          setPercent(Math.ceil(inputPercent * 100));
        }
      }
    }
  };

  const handleApprove = async () => {
    if (!isApproved && !isLoading) {
      const pairAddress = window.tronWeb.address.fromHex(
        await connector.getPairAddress(firstToken.address, secondToken.address),
      );
      try {
        setLoading(true);
        const res = await connector.approveToken(
          'pair',
          pairAddress,
          contract.ROUTER.chain[type].address,
        );
        modals.info.setMsg('You have successfully approved LP token amount', 'success');
        clogData('approve res:', res);
        setApproved(true);
        setLoading(false);
      } catch (e: any) {
        if (e.error && e.transaction) {
          const allowance = await connector.checkAllowance(
            'pair',
            user.address,
            pairAddress,
            contract.ROUTER.chain[type].address,
          );
          if (allowance) {
            modals.info.setMsg('You have successfully approved LP token amount', 'success');
            setApproved(true);
          } else modals.info.setMsg('Something went wrong', 'error');
        } else modals.info.setMsg('Something went wrong', 'error');
        clogData('approve lp error:', e);
        setLoading(false);
      }
    }
  };

  const handleRemove = () => {
    if (!isLoading && isApproved && !lpAmountError) {
      modals.removeLiquidity.setRemove(
        firstToken.address,
        secondToken.address,
        decimals.first,
        decimals.second,
        decimals.lp,
        new BigNumber(lpAmount).times(10 ** decimals.lp).toFixed(0, 1),
        new BigNumber(firstTokenAmount).times(10 ** decimals.first).toFixed(0, 1),
        new BigNumber(secondTokenAmount).times(10 ** decimals.second).toFixed(0, 1),
        prices.first,
        prices.second,
      );
    }
  };

  const getPoolData = useCallback(async () => {
    const pairAddress = await connector.getPairAddress(
      [...tokenList, ...user.importedTokens][user.tokenIndex.first].address,
      [...tokenList, ...user.importedTokens][user.tokenIndex.second].address,
    );
    const pair = await connector.getContract(pairAddress, contract.PAIR.chain[type].abi);
    const token0 = window.tronWeb.address.fromHex(await pair.token0().call({ _isConstant: true }));
    const token1 = window.tronWeb.address.fromHex(await pair.token1().call({ _isConstant: true }));
    const tokens = [...tokenList, ...user.importedTokens];
    tokens.forEach((token) => {
      if (token0 === WTRX) {
        if (token.address === '') setFirstToken(token);
      } else if (token.address === token0) setFirstToken(token);
      if (token1 === WTRX) {
        if (token.address === '') setSecondToken(token);
      } else if (token.address === token1) setSecondToken(token);
    });
    const decimals0 = await connector.getDecimals(token0);
    const decimals1 = await connector.getDecimals(token1);
    const decimalsLP = (+decimals0 + +decimals1) / 2;
    setDecimals({ first: +decimals0, second: +decimals1, lp: +decimalsLP });
    clogData('decimals:', `0 = ${decimals0}, 1 = ${decimals1}, lp = ${decimalsLP}`);
    const totalSupply = await pair.totalSupply().call({ _isConstant: true });
    // eslint-disable-next-line no-underscore-dangle
    const totalLP = new BigNumber(totalSupply._hex).toString(10);
    const balanceOf = await pair.balanceOf(user.address).call({ _isConstant: true });
    // eslint-disable-next-line no-underscore-dangle
    const yourBalance = new BigNumber(balanceOf._hex).toString(10);
    const allowanceLP = await connector.checkAllowance(
      'pair',
      user.address,
      window.tronWeb.address.fromHex(pairAddress),
      contract.ROUTER.chain[type].address,
    );
    setApproved(allowanceLP);
    const share = new BigNumber(yourBalance).dividedBy(totalLP).toString(10);
    clogData('shareOfPool:', share);
    const reserves = await pair.getReserves().call({ _isConstant: true });
    // eslint-disable-next-line no-underscore-dangle
    const reserve0 = new BigNumber(reserves._reserve0._hex).toString(10);
    const firstReserve = new BigNumber(reserve0).dividedBy(10 ** decimals0).toString(10);
    clogData('reserve0:', firstReserve);
    // eslint-disable-next-line no-underscore-dangle
    const reserve1 = new BigNumber(reserves._reserve1._hex).toString(10);
    const secondReserve = new BigNumber(reserve1).dividedBy(10 ** decimals1).toString(10);
    clogData('reserve1:', secondReserve);
    setPrices({
      first: +new BigNumber(secondReserve).dividedBy(firstReserve).toString(10),
      second: +new BigNumber(firstReserve).dividedBy(secondReserve).toString(10),
    });
    const shareOfReserve0 = new BigNumber(reserve0).times(share).toString(10);
    const shareOfReserve1 = new BigNumber(reserve1).times(share).toString(10);
    setYourReserves({ first: shareOfReserve0, second: shareOfReserve1 });
    setShareOfPool(+share);
    setLpBalance(yourBalance);
  }, [WTRX, connector, contract, type, user]);

  useEffect(() => {
    if (user.address && lpBalance === '') {
      getPoolData();
    }
  }, [getPoolData, lpBalance, user.address]);

  useEffect(() => {
    if (+lpAmount > +new BigNumber(lpBalance).dividedBy(10 ** decimals.lp).toString(10)) {
      setLpAmountError("value can't be greater then LP balance");
    } else if (+lpAmount <= 0) {
      setLpAmountError('value should be greater then 0');
    } else setLpAmountError('');
  }, [decimals.lp, lpAmount, lpBalance]);

  return (
    <div className="remove-page">
      <div className="remove-page__header">
        Remove liquidity
        <Button onClick={modals.options.open} className="remove-page__header__options">
          <img src={OptionsImg} alt="options icon" />
        </Button>
      </div>
      <div className="remove-page__tip">
        <b>Tip:</b>&nbsp;Removing pool tokens converts your position back into underlying tokens at
        the current rate, proportional to your share of the pool. Accrued fees are included in the
        amounts you receive.
      </div>
      <div className={`remove-page__amount ${isSimple ? '' : 'grey-box'}`}>
        <div className="remove-page__amount__header">
          Remove Amount
          <Button onClick={() => setSimple(!isSimple)} className="remove-page__amount__header__btn">
            {isSimple ? 'Simple' : 'Detailed'}
          </Button>
        </div>
        {isSimple ? (
          <>
            <div className="remove-page__amount__percent">
              <input
                type="text"
                value={percent}
                onChange={(e) => handleSetPercent(+e.target.value)}
              />
              %
            </div>
            <div className="remove-page__amount__range">
              <input
                type="range"
                value={+percent}
                min={1}
                max={100}
                onChange={(e) => handleSetPercent(+e.target.value)}
              />
            </div>
            <div className="remove-page__amount__btns">
              <Button onClick={() => handleSetPercent(25)} className="remove-page__amount__btn">
                25%
              </Button>
              <Button onClick={() => handleSetPercent(50)} className="remove-page__amount__btn">
                50%
              </Button>
              <Button onClick={() => handleSetPercent(75)} className="remove-page__amount__btn">
                75%
              </Button>
              <Button onClick={() => handleSetPercent(100)} className="remove-page__amount__btn">
                Max
              </Button>
            </div>
          </>
        ) : (
          <div className="remove-page__amount__percent">{percent}%</div>
        )}
      </div>
      {isSimple ? (
        <div className="remove-page__tokens grey-box">
          <div className="remove-page__tokens__token">
            <div className="remove-page__tokens__token__amount">
              {new BigNumber(firstTokenAmount).toFixed(5, 1)}
            </div>
            <div className="remove-page__tokens__token__info shadow-btn">
              <img className="shadow-btn__logo" src={firstToken.logo} alt={firstToken.name} />
              {firstToken.symbol}
            </div>
          </div>
          <div className="remove-page__tokens__token">
            <div className="remove-page__tokens__token__amount">
              {new BigNumber(secondTokenAmount).toFixed(5, 1)}
            </div>
            <div className="remove-page__tokens__token__info shadow-btn">
              <img className="shadow-btn__logo" src={secondToken.logo} alt={secondToken.name} />
              {secondToken.symbol}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grey-box">
            <div className="remove-page__tokens__token">
              <input
                type="text"
                value={lpAmount}
                placeholder="0"
                onChange={(e) => handleChangeAmount('lp', e)}
              />
              <div className="shadow-btn">
                <img className="shadow-btn__logo" src={firstToken.logo} alt={firstToken.name} />
                <img
                  className="shadow-btn__logo__second"
                  src={secondToken.logo}
                  alt={secondToken.name}
                />
                {firstToken.symbol}:{secondToken.symbol}
              </div>
            </div>
            <div className="remove-page__tokens__balance">
              Balance: {new BigNumber(lpBalance).dividedBy(10 ** decimals.lp).toFixed(5, 1)}{' '}
              {firstToken.symbol}:{secondToken.symbol}
              <Button onClick={setMax} className="remove-page__tokens__balance__max">
                MAX
              </Button>
            </div>
            <div className="remove-page__tokens__error">{lpAmountError}</div>
          </div>
          <div className="white-circle">
            <img src={ArrowBlack} alt="arrow black" />
          </div>
          <div className="remove-page__tokens__token grey-box">
            <input
              type="text"
              value={firstTokenAmount}
              placeholder="0"
              onChange={(e) => handleChangeAmount('first', e)}
            />
            <div className="shadow-btn">
              <img className="shadow-btn__logo" src={firstToken.logo} alt={firstToken.name} />
              {firstToken.symbol}
            </div>
          </div>
          <div className="white-circle">+</div>
          <div className="remove-page__tokens__token grey-box">
            <input
              type="text"
              value={secondTokenAmount}
              placeholder="0"
              onChange={(e) => handleChangeAmount('second', e)}
            />
            <div className="shadow-btn">
              <img className="shadow-btn__logo" src={secondToken.logo} alt={secondToken.name} />
              {secondToken.symbol}
            </div>
          </div>
        </>
      )}
      <div className="remove-page__prices">
        Price
        <div className="remove-page__prices__list">
          <div title={new BigNumber(prices.first).toString(10)}>
            1 {firstToken.symbol} = {new BigNumber(prices.first).toFixed(5, 1)} {secondToken.symbol}
          </div>
          <div title={new BigNumber(prices.second).toString(10)}>
            1 {secondToken.symbol} = {new BigNumber(prices.second).toFixed(5, 1)}{' '}
            {firstToken.symbol}
          </div>
        </div>
      </div>
      <div className="remove-page__btns">
        <Button
          onClick={handleApprove}
          className={`remove-page__btns__btn yellow-btn ${isApproved ? 'disabled' : ''}`}
        >
          {/* eslint-disable-next-line no-nested-ternary */}
          {isLoading ? 'Wait...' : isApproved ? 'Approved' : 'Approve'}
        </Button>
        <Button
          onClick={handleRemove}
          className={`remove-page__btns__btn brown-btn ${
            isApproved && !lpAmountError ? '' : 'disabled'
          }`}
        >
          Remove
        </Button>
      </div>
    </div>
  );
});

export default RemoveLiquidity;
