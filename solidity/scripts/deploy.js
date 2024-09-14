const { ethers, network } = require("hardhat");
const { writeAddr } = require('./recoder.js');

async function main() {
    let [owner] = await ethers.getSigners();
    let contractName = 'Test';
    const contract = await ethers.getContractFactory(contractName);

    // 部署合约
    let params = [];
    const instance = await contract.deploy(...params);
    await instance.deployed();

    console.log(`\ndeployer:`, owner.address);
    console.log(`\ncontract[${contractName}] deployed to:`, instance.address);

    await writeAddr(instance.address, contractName, network.name);

    if (!['hardhat', 'local'].includes(network.name)) {
        console.log('\nPlease verify contract:\n', `npx hardhat verify ${instance.address} --network ${network.name} ${params.join(' ')}`);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });