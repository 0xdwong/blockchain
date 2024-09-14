require("@nomicfoundation/hardhat-toolbox");

const mnemonic = process.env.MNEMONIC

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://localhost:8545",
    },
    goerli: {
      url: 'https://ethereum-goerli.publicnode.com',
      saveDeployments: true,
      accounts: {
        mnemonic
      },
      chainId: 5,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY
  }
};
