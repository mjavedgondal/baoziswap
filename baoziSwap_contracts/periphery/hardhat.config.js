/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 require('@nomiclabs/hardhat-ethers');
 require("@nomiclabs/hardhat-waffle");
 require('@nomiclabs/hardhat-etherscan');
 require('dotenv').config();
 const {
  MNEMONIC,
  ETHERSCAN_API_KEY
 } = process.env;

 
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    kovan: {
      url: `https://kovan.infura.io/v3/0d76000c0f1440679e3fe7eff763f43e`,
      accounts: {
        mnemonic: MNEMONIC
      }
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
};
