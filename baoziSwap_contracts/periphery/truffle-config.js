const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config();
const {
    ETHERSCAN_API_KEY,
    HECOINFO_API_KEY,
    BSCSCAN_API_KEY,
    MATIC_API_KEY,
    MNEMONIC,
    DEPLOY_GAS_LIMIT,
    DEPLOY_GAS_PRICE,
    INFURA_ID_PROJECT
} = process.env;

const Web3 = require("web3");
const web3 = new Web3();

module.exports = {
    plugins: ['truffle-plugin-verify'],

    api_keys: {
        etherscan: ETHERSCAN_API_KEY,
        bscscan: BSCSCAN_API_KEY,
        hecoinfo: HECOINFO_API_KEY,
        polygonscan: MATIC_API_KEY
    },

    networks: {
        //  development: {
        //     host: "127.0.0.1",
        //     port: 7545,
        //     network_id: "5777",
        //     gas: 12000000
        // }, 
        ropsten: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/" + INFURA_ID_PROJECT),
            network_id: 3,
            gas: DEPLOY_GAS_LIMIT,
            confirmations: 2,
            skipDryRun: true
        },
        mainnet: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://mainnet.infura.io/v3/" + INFURA_ID_PROJECT),
            network_id: 1,
            confirmations: 2,
            gasPrice: web3.utils.toWei(DEPLOY_GAS_PRICE, 'gwei'),
            gas: DEPLOY_GAS_LIMIT,
            skipDryRun: false
        },
        kovan: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://kovan.infura.io/v3/" + INFURA_ID_PROJECT),
            network_id: 42,
            confirmations: 1,
            gas: DEPLOY_GAS_LIMIT,
            networkCheckTimeout: 999999,
            skipDryRun: false
        },
        rinkeby: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/" + INFURA_ID_PROJECT),
            network_id: 4,
            confirmations: 2,
            gas: DEPLOY_GAS_LIMIT,
            skipDryRun: true
        },
        avalanche: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://api.avax.network/ext/bc/C/rpc"),
            network_id: "*",
            gasPrice: web3.utils.toWei(DEPLOY_GAS_PRICE, 'gwei'),
            gas: DEPLOY_GAS_LIMIT,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: false
        },
        fuji: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://api.avax-test.network/ext/bc/C/rpc"),
            network_id: "*",
            gas: 3000000,
            gasPrice: 470000000000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        bscTestnet: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://data-seed-prebsc-1-s3.binance.org:8545"),
            network_id: 97,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        bsc: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://bsc-dataseed.binance.org"),
            network_id: 56,
            confirmations: 2,
            gasPrice: web3.utils.toWei(DEPLOY_GAS_PRICE, 'gwei'),
            gas: DEPLOY_GAS_LIMIT,
            timeoutBlocks: 200,
            skipDryRun: false
        },
        maticMainnet: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://polygon-rpc.com/"),
            network_id: 137,
            confirmations: 2,
            gasPrice: web3.utils.toWei(DEPLOY_GAS_PRICE, 'gwei'),
            gas: DEPLOY_GAS_LIMIT,
            timeoutBlocks: 200,
            skipDryRun: false
        },
        maticTestnet: {
            provider: () => new HDWalletProvider(MNEMONIC, "https://matic-mumbai.chainstacklabs.com"),
            network_id: 80001,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        hecoTestnet: {
            provider: () => new HDWalletProvider(MNEMONIC, 'https://http-testnet.hecochain.com'),
            network_id: 256,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true 
        },
        hecoMainnet: {
            provider: () => new HDWalletProvider(MNEMONIC, 'https://http-mainnet.hecochain.com'),
            network_id: 128,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: false
        }
    },

    mocha: {
        reporter: 'eth-gas-reporter',
        reporterOptions : {
            onlyCallMethod : false,
            excludeContracts : ['Migrations']
        } // See options below
    },

    compilers: {
        solc: {
            version: "0.8.6",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 1
                }
            }
        }
    }
};