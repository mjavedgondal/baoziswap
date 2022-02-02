import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import { RemoveLiquidity } from '../../components';

import './PageRemoveLiquidity.scss';

const PageRemoveLiquidity: React.FC = observer(() => {
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
        <RemoveLiquidity />
      </div>
    </section>
  );
});

export default PageRemoveLiquidity;
