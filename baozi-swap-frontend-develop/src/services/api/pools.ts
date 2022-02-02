import axios from '../../core/axios';

export default {
  getPools: (): Promise<any> => axios.get('pools/'),
  getYourPools: (walletAddress: string): Promise<any> => axios.get(`pools/${walletAddress}/`),
};
