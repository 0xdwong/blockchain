require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");

let dotenv = require('dotenv')
dotenv.config()

const mnemonic = process.env.MNEMONIC
const scankey = process.env.ETHERSCAN_API_KEY


module.exports = {
    solidity: "0.8.4",
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            chainId: 31337,
            accounts: {
                count: 20,
                initialIndex: 0,
                mnemonic,
                path: "m/44'/60'/0'/0",
                accountsBalance: '10000000000000000000000', // (10000 ETH)
            },
        },
        main: {
            url: 'https://eth.llamarpc.com',
            accounts: {
                count: 1,
                initialIndex: 0,
                mnemonic,
                path: "m/44'/60'/0'/0",
            },
            chainId: 1,
        },
        goerli: {
            url: 'https://rpc.ankr.com/eth_goerli',
            saveDeployments: true,
            accounts: {
                count: 1,
                initialIndex: 0,
                mnemonic,
                path: "m/44'/60'/0'/0",
            },
            chainId: 5,
        },
        polygon: {
            url: 'https://polygon.llamarpc.com',
            accounts: {
                mnemonic: mnemonic,
            },
            chainId: 137,
        },
        mumbai: {
            url: 'https://matic-mumbai.chainstacklabs.com',
            accounts: {
                mnemonic: mnemonic,
            },
            gasPrice: 30000000000,
            chainId: 80001,
        },
        dev: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: scankey
    },
    settings: {
        optimizer: {
            enabled: true,
        },
    },
    abiExporter: {
        path: './deployments/abi',
        runOnCompile: true,
        clear: true,
        flat: true,
        spacing: 2,
        pretty: true,
    },
};