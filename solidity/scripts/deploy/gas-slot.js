const { ethers, network } = require("hardhat");
const { writeAddr } = require('../recoder.js');

async function main() {
    let [owner] = await ethers.getSigners();

    // 部署合约
    let contractName = 'B';
    let params = [];
    const instance = await ethers.deployContract(contractName, params);
    await instance.waitForDeployment();
    const instanceAddr = await instance.getAddress();

    // console.log(`\ndeployer:`, owner.address);
    console.log(`\ncontract[${contractName}] deployed to:`, instanceAddr);

    const hash = instance.deploymentTransaction().hash;
    const receipt = await ethers.provider.getTransactionReceipt( hash );
    console.log(`====`, receipt.gasUsed);

    await writeAddr(instance.address, contractName, network.name);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });