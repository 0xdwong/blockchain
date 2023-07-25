const { ethers, network } = require("hardhat");
const { expect } = require('chai');
const { MockProvider } = require('ethereum-waffle');
const provider = new MockProvider();

let factory, myERC721, owner;

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    // factory
    const CloneFactory = await ethers.getContractFactory("Factory");
    factory = await CloneFactory.deploy();

    // myERC721
    const MyERC721 = await ethers.getContractFactory("MyERC721");
    myERC721 = await MyERC721.deploy();
}

describe.only("EventPOAPMinter", () => {
    beforeEach(async () => {
        await init();
    })

    describe('clone', () => {
        it("clone succeed", async () => {
            expect(
                await factory.connect(owner).clone(myERC721.address)
            ).to.emit(factory, 'Cloned')
        });
    });
});