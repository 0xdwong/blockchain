const { expect } = require('chai');
const { ethers } = require('hardhat');

let contrac;
let accounts = [];
let owner, account1;

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    account1 = accounts[1];

    const factory = await ethers.getContractFactory('AccessControl');
    contrac = await factory.deploy();
    await contrac.deployed();
}

describe('AccessControl', () => {

    before(async () => {
        await init();
    });

    describe('addBalance', () => {
        it('setOwner should be private', async () => {
            let errMsg = '';
            try{
                await contrac.connect(account1).setOwner(account1.address);
            }catch(err){
                errMsg = err.message;
            }

            expect(errMsg).contains('setOwner is not a function')
        });
    })
});