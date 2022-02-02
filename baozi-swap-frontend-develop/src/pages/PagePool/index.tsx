import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import { LiquiditySet } from '../../components';

import './PagePool.scss';

const PagePool: React.FC = observer(() => {
  return (
    <section className="page-pool">
      <div className="page-pool__container">
        <div className="page-pool__container__tabs">
          <Link className="page-pool__container__tabs__tab" to="/">
            Swap
          </Link>
          <div className="page-pool__container__tabs__tab active">Pool</div>
        </div>
        <LiquiditySet />
      </div>
    </section>
  );
});

export default PagePool;
