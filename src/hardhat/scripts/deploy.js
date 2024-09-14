const { ethers, network } = require("hardhat");
const { writeAddr } = require('./recoder.js');

async function main() {
    let [owner] = await ethers.getSigners();
    let contractName = 'Simple';

    // 部署合约
    let params = [];
    instance = await ethers.deployContract(contractName, params);
    await instance.waitForDeployment();

    const instanceAddr = await instance.getAddress();

    console.log(`\ndeployer:`, owner.address);
    console.log(`\ncontract[${contractName}] deployed to:`, instanceAddr);

    await writeAddr(instanceAddr, contractName, network.name);

    if (!['hardhat', 'local'].includes(network.name)) {
        console.log('\nPlease verify contract:\n', `npx hardhat verify ${instanceAddr} --network ${network.name} ${params.join(' ')}`);
    }
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });