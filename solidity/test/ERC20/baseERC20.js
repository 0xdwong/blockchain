const { expect } = require('chai');
const { ethers } = require('hardhat');

let token;
let accounts = [];
let owner;
const oneEther = ethers.parseUnits('1.0', "ether");
const randomAddr = ethers.Wallet.createRandom().address;

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    token = await ethers.deployContract("BaseERC20");
    // console.log('====contract address====', await token.getAddress());
}

describe.only('BaseERC20', () => {
    before(async () => {
        await init();
    });

    describe('mint', () => {
        it('onlyOwner', async () => {
            const sender = accounts[1]; //not owner

            await expect(
                token.connect(sender).mint(randomAddr, oneEther)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it('mint succeed', async () => {
            await expect(
                () => token.connect(owner).mint(randomAddr, oneEther)
            ).to.changeTokenBalances(token, [randomAddr], [oneEther]);
        });
    })
});