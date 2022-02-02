import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import { SwapForm } from '../../components';

import './PageMain.scss';

const PageMain: React.FC = observer(() => {
  return (
    <section className="main">
      <div className="main__container">
        <div className="main__container__tabs">
          <div className="main__container__tabs__tab active">Swap</div>
          <Link className="main__container__tabs__tab" to="/pool">
            Pool
          </Link>
        </div>
        <SwapForm />
      </div>
    </section>
  );
});

export default PageMain;
