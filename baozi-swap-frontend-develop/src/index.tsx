// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import TronLinkService from './services/web3';
import { Provider, rootStore } from './store/store';
import { App } from './App';

import './styles/global.scss';

ReactDOM.render(
  <Provider value={rootStore}>
    <Router>
      <TronLinkService>
        <App />
      </TronLinkService>
    </Router>
  </Provider>,
  document.getElementById('root'),
);
