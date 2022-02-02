import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import { poolsApi } from '../../services/api';
import { useMst } from '../../store/store';
import { TypePool } from '../../types';
import { clogData } from '../../utils/logger';
import { LiquidityPool } from '../index';

import './LiquiditySet.scss';

const LiquiditySet: React.FC = observer(() => {
  const [pools, setPools] = useState([]);
  const { user } = useMst();

  clogData('pools:', pools);

  const getPairs = useCallback(async () => {
    if (user.address) {
      const fetchedPools = await poolsApi.getYourPools(user.address);
      setPools(fetchedPools.data);
    }
  }, [user.address]);

  useEffect(() => {
    if (user.address) {
      getPairs();
    }
  }, [getPairs, user.address]);

  return (
    <div className="liquidity-set shadow-box">
      <div className="liquidity-set__header">Your liquidity</div>
      <div className="liquidity-set__btns">
        <Link to="/create">
          <div className="liquidity-set__create yellow-btn">Add liquidity</div>
        </Link>
      </div>
      <div className="liquidity-set__pools">
        {pools.length ? (
          pools.map((pool: TypePool, index: number) => {
            return pool.token0.address === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' ||
              pool.token1.address === 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' ? (
              ''
            ) : (
              <LiquidityPool key={`pool ${index + 1}`} pool={pool} />
            );
          })
        ) : (
          <div className="liquidity-set__pools__empty">
            Your liquidity positions will appear here
          </div>
        )}
      </div>
    </div>
  );
});

export default LiquiditySet;
