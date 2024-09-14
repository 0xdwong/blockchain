const { expect } = require('chai');
const { ethers } = require('hardhat');

let contract;

async function init() {
    contract = await ethers.deployContract("Overflow");
}

describe('Overflow', () => {

    before(async () => {
        await init();
    });

    describe('test1', () => {
        it('should return 0', async () => {
            const result = await contract.test1();
            expect(result).to.equal(0);
        });
    })

    describe('test2', () => {
        it('should return 255', async () => {
            const result = await contract.test2();
            expect(result).to.equal(255);
        });
    })
});