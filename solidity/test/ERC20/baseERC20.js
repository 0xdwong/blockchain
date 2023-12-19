const { expect } = require('chai');
const { ethers } = require('hardhat');

let contractInstance;
let accounts = [];
let owner;
const oneEther = ethers.parseUnits('1.0', "ether");
const randomAddr = ethers.Wallet.createRandom().address;

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    contractInstance = await ethers.deployContract("BaseERC20");
    // console.log('====contract address====', await contractInstance.getAddress());
}

describe('BaseERC20', () => {
    before(async () => {
        await init();
    });

    describe('mint', () => {
        it('onlyOwner', async () => {
            const sender = accounts[1]; //not owner

            await expect(
                contractInstance.connect(sender).mint(randomAddr, oneEther)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('mint succeed', async () => {
            contractInstance.connect(owner).mint(randomAddr, oneEther)
        });
    })
});