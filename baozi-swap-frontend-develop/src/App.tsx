import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import {
  Footer,
  Header,
  InfoModal,
  OptionsModal,
  RemoveLiquidityModal,
  TokenSelectModal,
  UserInfoModal,
} from './components';
import { Page404, PageAddLiquidity, PageMain, PagePool, PageRemoveLiquidity } from './pages';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route path="/" exact>
            <PageMain />
          </Route>
          <Route path="/pool">
            <PagePool />
          </Route>
          <Route path="/create">
            <PageAddLiquidity />
          </Route>
          <Route path="/remove">
            <PageRemoveLiquidity />
          </Route>
          <Route path="*">
            <Page404 />
          </Route>
        </Switch>
        <Footer />
        <UserInfoModal />
        <InfoModal />
        <OptionsModal />
        <TokenSelectModal />
        <RemoveLiquidityModal />
      </div>
    </Router>
  );
};
