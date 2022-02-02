import axios from 'axios';

export default {
  getTokens: (walletAddress: string): Promise<any> => axios.get(`/tokens/${walletAddress}/`),
  addToken: (data: any, walletAddress: string): Promise<any> =>
    axios.post(`/tokens/${walletAddress}/`, data),
};
