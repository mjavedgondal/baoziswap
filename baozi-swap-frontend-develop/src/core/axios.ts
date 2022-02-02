import axios from 'axios';

import { isProduction } from '../config';

axios.defaults.baseURL = isProduction
  ? 'https://baoziswap.finance/api/v1'
  : 'https://devbaozi.rocknblock.io/api/v1';

export default axios;
