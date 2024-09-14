const { ethers, network } = require("hardhat");

async function main() {
    let [owner] = await ethers.getSigners();

    // 部署合约
    let contractName = 'Quiz1';
    let params = [];
    const instance = await ethers.deployContract(contractName, params);
    await instance.waitForDeployment();

    // await instance.getDataFromCalldata('0xabcd');

    // call
    await instance.compare();
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });