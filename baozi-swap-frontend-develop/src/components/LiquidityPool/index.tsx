import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';

import ArrowDown from '../../assets/icons/arrow-down-black.svg';
import ArrowUp from '../../assets/icons/arrow-up-white.svg';
import { DefaultLogo } from '../../assets/icons/tokens';
import { contracts } from '../../config';
import { tokenList } from '../../config/tokens';
import { useTronLinkService } from '../../services/web3';
import { useMst } from '../../store/store';
import { TypePool, TypePoolData, TypeToken } from '../../types';
import { clogData } from '../../utils/logger';
import { Button } from '../index';

import './LiquidityPool.scss';

type TypeLiquidityPoolProps = {
  pool: TypePool;
};

const LiquidityPool: React.FC<TypeLiquidityPoolProps> = observer(({ pool }) => {
  const [isManageOpen, setManageOpen] = useState(false);
  const [poolData, setPoolData] = useState({} as TypePoolData);
  const [firstToken, setFirstToken] = useState<TypeToken>({} as TypeToken);
  const [secondToken, setSecondToken] = useState<TypeToken>({} as TypeToken);
  const connector = useTronLinkService().connectorService;
  const { contract, type } = contracts;
  const { user } = useMst();
  const tokens = useRef([...tokenList, ...user.importedTokens]);
  const WTRX = contract.WTRX.chain[type].address;

  const getPoolData = useCallback(async () => {
    if (user.address) {
      try {
        const pair = await connector.getContract(pool.address, contract.PAIR.chain[type].abi);
        const pairDecimals = (pool.token0.decimals + pool.token1.decimals) / 2;
        const reserves = await pair.getReserves().call({ _isConstant: true });
        const reserve0 =
          // eslint-disable-next-line no-underscore-dangle
          new BigNumber(reserves._reserve0._hex).dividedBy(10 ** pool.token0.decimals).toString(10);
        const reserve1 =
          // eslint-disable-next-line no-underscore-dangle
          new BigNumber(reserves._reserve1._hex).dividedBy(10 ** pool.token1.decimals).toString(10);
        const totalSupply = await pair.totalSupply().call({ _isConstant: true });
        // eslint-disable-next-line no-underscore-dangle
        const total = new BigNumber(totalSupply._hex).dividedBy(10 ** +pairDecimals).toString(10);
        const balanceOf = await pair.balanceOf(user.address).call({ _isConstant: true });
        // eslint-disable-next-line no-underscore-dangle
        const yourBalance = new BigNumber(balanceOf._hex)
          .dividedBy(10 ** +pairDecimals)
          .toString(10);
        setPoolData({
          totalSupply: total,
          reserve0,
          reserve1,
          balanceOf: yourBalance,
        });
      } catch (err: any) {
        clogData('getPoolData error:', err);
      }
    }
  }, [connector, contract.PAIR.chain, pool, type, user.address]);

  const handleSetTokens = async () => {
    tokens.current.forEach((token, index) => {
      if ((token.address || WTRX) === pool.token0.address) user.setFirstIndex(index);
      if ((token.address || WTRX) === pool.token1.address) user.setSecondIndex(index);
    });
  };

  useEffect(() => {
    let token0;
    let token1;

    tokens.current.forEach((token) => {
      if ((token.address || WTRX) === pool.token0.address) token0 = token;
      if ((token.address || WTRX) === pool.token1.address) token1 = token;
    });

    if (token0) {
      setFirstToken(token0);
    } else
      setFirstToken({
        name: pool.token0.name,
        symbol: pool.token0.symbol,
        address: pool.token0.address,
        decimals: pool.token0.decimals,
        logo: '',
      });

    if (token1) {
      setSecondToken(token1);
    } else
      setSecondToken({
        name: pool.token1.name,
        symbol: pool.token1.symbol,
        address: pool.token1.address,
        decimals: pool.token1.decimals,
        logo: '',
      });
  }, [WTRX, contract.WTRX.chain, isManageOpen, pool, type]);

  useEffect(() => {
    if (isManageOpen) getPoolData();
  }, [getPoolData, isManageOpen]);

  return (
    <div className={`liquidity-pool ${isManageOpen ? 'open' : ''}`}>
      <div className="liquidity-pool__header">
        <div className="liquidity-pool__info">
          <div className="liquidity-pool__info__logo">
            <img src={firstToken.logo || DefaultLogo} alt="first token" className="first-token" />
            <img
              src={secondToken.logo || DefaultLogo}
              alt="second token"
              className="second-token"
            />
          </div>
          <div className="liquidity-pool__info__name">
            {`${firstToken.symbol || 'token name'} / ${secondToken.symbol || 'token name'}`}
          </div>
        </div>
        <Button className="liquidity-pool__btn" onClick={() => setManageOpen(!isManageOpen)}>
          Manage
          <img src={isManageOpen ? ArrowUp : ArrowDown} alt="arrow down black" />
        </Button>
      </div>
      {isManageOpen ? (
        <div className="liquidity-pool__content">
          <div className="liquidity-pool__content__item">
            <div className="liquidity-pool__content__item__key">Total pool tokens:</div>
            <div
              className="liquidity-pool__content__item__value"
              title={new BigNumber(poolData.totalSupply).toString(10)}
            >
              {new BigNumber(poolData.totalSupply).toFixed(5, 1)}
            </div>
          </div>
          <div className="liquidity-pool__content__item">
            <div className="liquidity-pool__content__item__key">
              Pooled {firstToken.name || 'token name'}:
            </div>
            <div
              className="liquidity-pool__content__item__value"
              title={new BigNumber(poolData.reserve0).toString(10)}
            >
              {new BigNumber(poolData.reserve0).toFixed(5, 1)}
              <img src={firstToken.logo || DefaultLogo} alt={firstToken.name} />
            </div>
          </div>
          <div className="liquidity-pool__content__item">
            <div className="liquidity-pool__content__item__key">
              Pooled {secondToken.name || 'token name'}:
            </div>
            <div
              className="liquidity-pool__content__item__value"
              title={new BigNumber(poolData.reserve1).toString(10)}
            >
              {new BigNumber(poolData.reserve1).toFixed(5, 1)}
              <img src={secondToken.logo || DefaultLogo} alt={secondToken.name} />
            </div>
          </div>
          <div className="liquidity-pool__content__item">
            <div className="liquidity-pool__content__item__key">Your total pool tokens:</div>
            <div
              className="liquidity-pool__content__item__value"
              title={new BigNumber(poolData.balanceOf).toString(10)}
            >
              {new BigNumber(poolData.balanceOf).toFixed(5, 1)}
            </div>
          </div>
          <div className="liquidity-pool__content__buttons">
            <Link to="/create" className="yellow-btn" onClick={handleSetTokens}>
              Add
            </Link>
            <Link to="/remove" className="yellow-btn" onClick={handleSetTokens}>
              Remove
            </Link>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
});

export default LiquidityPool;
