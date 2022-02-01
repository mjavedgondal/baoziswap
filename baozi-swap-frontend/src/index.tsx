import React from 'react';
import ReactDOM from 'react-dom';

import { stylizeConsole } from './utils/console';
import { App } from './App';

import './styles/index.scss';

stylizeConsole({ showConsoleLog: true });

ReactDOM.render(<App />, document.getElementById('root'));
