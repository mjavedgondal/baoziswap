import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import { AddLiquidity } from '../../components';

import './PageAddLiquidity.scss';

const PageAddLiquidity: React.FC = observer(() => {
  return (
    <section className="add-liquidity">
      <div className="add-liquidity__container">
        <div className="add-liquidity__container__tabs">
          <Link to="/" className="add-liquidity__container__tabs__tab">
            Swap
          </Link>
          <Link to="/pool" className="add-liquidity__container__tabs__tab active">
            Pool
          </Link>
        </div>
        <AddLiquidity />
      </div>
    </section>
  );
});

export default PageAddLiquidity;
