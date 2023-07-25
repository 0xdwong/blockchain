const { ethers, network } = require("hardhat");
const FactoryAddr = require(`../deployments/${network.name}/Factory.json`).address;
let factory;
let accounts;


async function init() {
    accounts = await ethers.getSigners();

    factory = await ethers.getContractAt('Factory', FactoryAddr);
}

async function clone() {
    const implementAddr = '0xD55FDd2614CC02dA72E1875c0caA40d1683e68D2'; // ERC721 goerli

    const receipt = await factory.connect(accounts[0]).clone(implementAddr);
    console.log('====hash====', receipt.hash);
}

async function callProxy(){
    const proxy = '0x1fb4D882d95c022886ADB94E2fe2c9a8c76082Fb';

    erc721 = await ethers.getContractAt('MyERC721', proxy);

    const name = await erc721.connect(accounts[0]).name();
    const symbol = await erc721.connect(accounts[0]).symbol();

    const receipt = await erc721.connect(accounts[0]).mint(accounts[0].address, 1);
    
    console.log({name, symbol, hash: receipt.hash});
}

async function main() {
    await init();

    // await clone();

    await callProxy();
}

main()