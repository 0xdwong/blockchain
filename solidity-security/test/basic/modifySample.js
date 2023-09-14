const { expect } = require('chai');

let contractInstance;
let accounts = [];
let owner;

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    contractInstance = await ethers.deployContract("ModifySample");
    // console.log('====contract address====', await contractInstance.getAddress());
}

describe('ModifySample', () => {

    before(async () => {
        await init();
    });

    it.only('multiModifier', async () => {
        await contractInstance.multiModifier();
        let a = await contractInstance.getA();
        expect(a).to.be.equal(11);
    });
});