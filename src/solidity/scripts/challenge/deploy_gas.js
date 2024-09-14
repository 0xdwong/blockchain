const { ethers, network } = require("hardhat");

async function main() {
    let [owner] = await ethers.getSigners();

    // 部署合约
    let contractName = 'Quiz8_2'; // Quiz2_1, Quiz2_2;  Quiz5_1, Quiz5_2
    let params = [];
    const instance = await ethers.deployContract(contractName, params);
    await instance.waitForDeployment();
    const instanceAddr = await instance.getAddress();

    // console.log(`\ndeployer:`, owner.address);
    console.log(`\ncontract[${contractName}] deployed to:`, instanceAddr);

    const hash = instance.deploymentTransaction().hash;
    // const hash = (await instance.getSupply()).hash;

    const receipt = await ethers.provider.getTransactionReceipt( hash );
    console.log(`====`, receipt.gasUsed);
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });