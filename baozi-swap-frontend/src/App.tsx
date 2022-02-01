import React, { memo } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { Header } from './components';
import { Page404, PageMain } from './pages';

export const App: React.FC = memo(() => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route path="/" exact>
            <PageMain />
          </Route>
          <Route path="*">
            <Page404 />
          </Route>
        </Switch>
      </div>
    </Router>
  );
});
