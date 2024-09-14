const { expect } = require('chai');
const ethers = require('ethers');

let vulnerableContrac, attackerContrac;
let accounts = [];
let owner, account1;
const ONE_ETH = ethers.parseUnits('1.0', "ether");

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    account1 = accounts[1];

    const factory1 = await ethers.getContractFactory('Vulnerable');
    vulnerableContrac = await factory1.deploy();
    await vulnerableContrac.deployed();

    const factory2 = await ethers.getContractFactory('Attacker');
    attackerContrac = await factory2.deploy(vulnerableContrac.address);
    await attackerContrac.deployed();
}

describe('attack', () => {

    before(async () => {
        await init();
    });

    describe('attack', () => {
        it('reentry-failed', async () => {
            // deposit 1 ETH to vulnerableContrac
            await vulnerableContrac.connect(owner).deposit({ value: ONE_ETH.mul(1) });

            await expect(
                attackerContrac.connect(account1).attack({ value: ONE_ETH })
            ).to.be.revertedWith("Transfer failed");
        });

        it.skip('reentry-succeed', async () => {
            // deposit 1 ETH to vulnerableContrac
            await vulnerableContrac.connect(owner).deposit({ value: ONE_ETH.mul(1) });

            // deposit 1 ETH but withdraw 2 ETH
            await attackerContrac.connect(account1).attack({ value: ONE_ETH });

            // vulnerableContrac ETH balance should be 0
            const ethBalance_vulnerableContrac = await ethers.provider.getBalance(vulnerableContrac.address);
            expect(ethBalance_vulnerableContrac).to.equal(0);

            // attackerContrac ETH balance should be 2 ETH
            const ethBalance_attackerContrac = await ethers.provider.getBalance(attackerContrac.address);
            expect(ethBalance_attackerContrac).to.equal(TWO_ETH)
        });
    })
});