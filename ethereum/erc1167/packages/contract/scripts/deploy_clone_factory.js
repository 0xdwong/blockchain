const { ethers, network, run } = require("hardhat");
const { writeAddr } = require('./recoder.js');

async function main() {
    let [owner] = await ethers.getSigners();
    let contractName = 'CloneFactory';
    const contractFactory = await ethers.getContractFactory(contractName);

    // 部署合约
    const params = [];
    const contract = await contractFactory.deploy(...params);
    await contract.deployed();

    console.log(`\ndeployer:`, owner.address);
    console.log(`\ncontract[${contractName}] deployed to:`, contract.address);

    await writeAddr(contract.address, contractName, network.name);

    if (!['hardhat', 'localhost'].includes(network.name)) {
        console.log('\nPlease verify contract:\n', `npx hardhat verify ${contract.address} --network ${network.name} ${params.join(' ')}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });