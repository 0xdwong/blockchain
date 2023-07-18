const { ethers, network } = require("hardhat");
const CloneFactoryAddr = require(`../deployments/${network.name}/CloneFactoryAddr.json`).address;
let cloneFactory;
let accounts;


async function init() {
    accounts = await ethers.getSigners();

    cloneFactory = await ethers.getContractAt('CloneFactory', CloneFactoryAddr);
}

async function createClone(implementAddr) {
    // mint
    const receipt = await cloneFactory.connect(accounts[0]).createClone(implementAddr);
    console.log('====hash====', receipt.hash);
}

async function main() {
    await init();

    // ERC721 goerli
    const implementAddr = '0xD55FDd2614CC02dA72E1875c0caA40d1683e68D2';
    await createClone(implementAddr);
}

main()