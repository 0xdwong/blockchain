const { ethers, network } = require("hardhat");

async function main() {
    let [owner] = await ethers.getSigners();

    // 部署合约
    let contractName = 'Demo12';
    let params = [];
    const instance = await ethers.deployContract(contractName, params);
    await instance.waitForDeployment();
    // const instanceAddr = await instance.getAddress();

    // console.log(`\ndeployer:`, owner.address);
    // console.log(`\ncontract[${contractName}] deployed to:`, instanceAddr);

    // call
    await instance.doSomething();
    await instance.doSomething2();
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });