const { expect } = require('chai');
const { ethers } = require('hardhat');


describe("BaseERC721", async () => {
    let contract, contractAddr;
    let receivercontract, receivercontractAddr;
    let accounts, owner;
    const name = 'BaseERC721';
    const symbol = 'BERC721';
    const baseURI = 'https://images.example.com/';

    const randomAccount = ethers.Wallet.createRandom();
    const randomAddr = randomAccount.address;
    const ZeroAddress = ethers.ZeroAddress;


    async function init() {
        // 部署合约
        accounts = await ethers.getSigners();
        owner = accounts[0];

        // const factory = await ethers.getContractFactory('BaseERC721');
        // contract = await factory.deploy();
        // await contract.deployed();

        contract = await ethers.deployContract("BaseERC721", [name, symbol, baseURI]);
        receivercontract = await ethers.deployContract("BaseERC721Receiver");

        contractAddr = await contract.getAddress();
        receivercontractAddr = await receivercontract.getAddress();
    }

    beforeEach(async () => {
        await init();
    })

    describe("IERC721Metadata", async () => {
        it("name", async () => {
            expect(await contract.name()).to.equal(name);
        });

        it("symbol", async () => {
            expect(await contract.symbol()).to.equal(symbol);
        });

        describe("tokenURI", async () => {
            it("URI query for nonexistent token should revert", async () => {
                const NONE_EXISTENT_TOKEN_ID = 1234
                await expect(
                    contract.tokenURI(NONE_EXISTENT_TOKEN_ID)
                ).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
            });

            it('Should return baseURI when tokenId exists', async function () {
                const tokenId = 1
                await contract.connect(owner).mint(randomAddr, tokenId);

                const expectURI = baseURI + String(tokenId);
                expect(await contract.tokenURI(tokenId)).to.equal(expectURI);
            });
        })
    })

    describe("IERC721", async () => {
        describe("balanceOf ", async () => {
            it("balanceOf", async () => {
                // before should be 0
                const beforeBalance = await contract.balanceOf(randomAddr);
                expect(beforeBalance).to.equal(0);

                // mint
                await contract.connect(owner).mint(randomAddr, 1);

                // after should be 1
                const afterBalance = await contract.balanceOf(randomAddr);
                expect(afterBalance).to.equal(1);
            });
        });

        describe("ownerOf ", async () => {
            it("ownerOf", async () => {
                const tokenId = 1;
                const receiver = randomAddr;
                // before should be 0 address
                const beforeBalance = await contract.ownerOf(tokenId);
                expect(beforeBalance).to.equal(ZeroAddress);

                // mint
                await contract.connect(owner).mint(receiver, 1);

                // after should be receiver
                const holder = await contract.ownerOf(tokenId);
                expect(holder).to.equal(receiver);
            });
        });

        describe('approve', function () {
            it('owner should approve successfully', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); //mint to self

                const to = randomAddr;
                await expect(
                    contract.connect(owner).approve(to, tokenId)
                ).to.emit(contract, "Approval")
                    .withArgs(owner.address, to, tokenId);

                // getApproved
                expect(await contract.getApproved(tokenId)).to.equal(to);
            });

            it('approved account should approve successfully', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); //mint to self

                // setApprovalForAll accounts1
                const caller = accounts[1];
                await contract.connect(owner).setApprovalForAll(caller.address, true)

                // accounts1 arpprove owner's tokenId[1] to randomAddr
                const to = randomAddr;
                expect(
                    await contract.connect(caller).approve(to, tokenId)
                ).to.be.ok;

                // getApproved
                expect(await contract.getApproved(tokenId)).to.equal(to);
            });

            it('Approve to current owner should revert', async function () {
                // mint token first
                const tokenId = 1;
                const receiver = owner.address; //self
                await contract.connect(owner).mint(receiver, tokenId);

                await expect(
                    contract.connect(owner).approve(receiver, tokenId)
                ).to.be.revertedWith("ERC721: approval to current owner");
            });

            it('Not owner nor approved token approveal should revert', async function () {
                // mint token first
                const tokenId = 1;
                const receiver = owner.address; //self
                await contract.connect(owner).mint(receiver, tokenId);

                const otherAccount = accounts[1]; //not owner or approved
                await expect(
                    contract.connect(otherAccount).approve(randomAddr, tokenId)
                ).to.be.revertedWith("ERC721: approve caller is not owner nor approved for all");
            });
        });

        describe('getApproved', function () {
            it('should return approval address', async function () {
                // mint token first
                const tokenId = 1;
                const receiver = owner.address; //self
                await contract.connect(owner).mint(receiver, tokenId);

                // approve
                const approvedAddr = randomAddr;
                await contract.connect(owner).approve(randomAddr, tokenId);

                expect(await contract.getApproved(tokenId)).to.equal(approvedAddr);
            });

            it('Approved query for nonexistent token should revert', async function () {
                const tokenId = 1; // not exists

                await expect(
                    contract.getApproved(tokenId)
                ).to.be.revertedWith('ERC721: approved query for nonexistent token');
            });
        });

        describe('setApprovalForAll', function () {
            it('setApprovalForAll true/flase', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const spender = randomAddr;

                // set true
                await contract.connect(owner).setApprovalForAll(spender, true);
                expect(await contract.isApprovedForAll(owner.address, spender)).to.equal(true);

                // set false
                await contract.connect(owner).setApprovalForAll(spender, false);
                expect(await contract.isApprovedForAll(owner.address, spender)).to.equal(false);
            });

            it('Approve to self should revert', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                await expect(
                    contract.connect(owner).setApprovalForAll(owner.address, true) // approve to self
                ).to.be.revertedWith("ERC721: approve to caller");
            });
        });

        describe('transferFrom', function () {
            it('owner account should succeed and balance should change', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;

                // balance change
                await expect(
                    contract.connect(owner).transferFrom(owner.address, to, tokenId)
                ).to.changeTokenBalances(contract, [owner.address, to], [-1, 1]);
            });

            it('approved account should succeed and balance should change', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;

                // approve
                const spenderAccout = accounts[1];
                await contract.connect(owner).approve(spenderAccout.address, tokenId)

                // transfer and balance should change
                await expect(
                    contract.connect(spenderAccout).transferFrom(owner.address, to, tokenId)
                ).to.changeTokenBalances(contract, [owner.address, to], [-1, 1]);
            });

            it('approvedForAll account should succeed and balance should change', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;

                // setApprovalForAll
                const spenderAccout = accounts[1];
                await contract.connect(owner).setApprovalForAll(spenderAccout.address, true)

                // transfer and balance should change
                await expect(
                    contract.connect(spenderAccout).transferFrom(owner.address, to, tokenId)
                ).to.changeTokenBalances(contract, [owner.address, to], [-1, 1]);
            });

            it('not owner nor approved should revert', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;
                const otherAccount = accounts[1]; //not owner or approved
                await expect(
                    contract.connect(otherAccount).transferFrom(owner.address, to, tokenId)
                ).to.revertedWith("ERC721: transfer caller is not owner nor approved");
            });

            it('none exists tokenId should revert', async function () {
                const NONE_EXISTENT_TOKEN_ID = Math.ceil(Math.random() * 1000000);
                const to = randomAddr;
                await expect(
                    contract.connect(owner).transferFrom(owner.address, to, NONE_EXISTENT_TOKEN_ID)
                ).to.revertedWith("ERC721: operator query for nonexistent token");
            });

            it('to zero address should revert', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = ZeroAddress;
                await expect(
                    contract.connect(owner).transferFrom(owner.address, to, tokenId)
                ).to.revertedWith("ERC721: transfer to the zero address");
            });

            it('from != caller.address should revert', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;
                const from = accounts[1].address;
                await expect(
                    contract.connect(owner).transferFrom(from, to, tokenId)
                ).to.revertedWith("ERC721: transfer from incorrect owner");
            });

            it('should revoke old approval when token transfered', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;

                // approve
                const spender = accounts[1].address;
                await contract.connect(owner).approve(spender, tokenId);
                expect(await contract.getApproved(tokenId)).to.equal(spender); //before

                // transfer
                await contract.connect(owner).transferFrom(owner.address, to, tokenId);

                // should revoke approval
                expect(await contract.getApproved(tokenId)).to.equal(ZeroAddress); // after
            });
        });

        describe('safeTransferFrom', function () {
            // same as transferFrom
            it('owner should succeed and balance should change', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;

                // balance change
                await expect(
                    contract.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, to, tokenId)
                ).to.changeTokenBalances(contract, [owner.address, to], [-1, 1]);
            });

            // same as transferFrom
            it('approved should succeed and balance should change', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;

                // approve
                const spenderAccout = accounts[1];
                await contract.connect(owner).approve(spenderAccout.address, tokenId)

                // transfer and balance should change
                await expect(
                    contract.connect(spenderAccout)["safeTransferFrom(address,address,uint256)"](owner.address, to, tokenId)
                ).to.changeTokenBalances(contract, [owner.address, to], [-1, 1]);
            });

            // same as transferFrom
            it('not owner nor approved should revert', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = randomAddr;
                const otherAccount = accounts[1]; //not owner or approved
                await expect(
                    contract.connect(otherAccount)["safeTransferFrom(address,address,uint256)"](owner.address, to, tokenId)
                ).to.revertedWith("ERC721: transfer caller is not owner nor approved");
            });

            it('transfer to none ERC721Receiver implementer should revert', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = contractAddr; // not support ERC721Receiver
                await expect(
                    contract.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, to, tokenId)
                ).to.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
            });

            it('transfer to ERC721Receiver implementer should succeed', async function () {
                // mint token first
                const tokenId = 1;
                await contract.connect(owner).mint(owner.address, tokenId); // mint to self

                const to = receivercontractAddr; // support ERC721Receiver
                expect(
                    await contract.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, to, tokenId)
                ).to.be.ok;
            });
        });
    })

    describe("mint", async () => {
        it('mint succeed should update balance', async function () {
            const tokenId = 1;

            await expect(
                contract.connect(owner).mint(randomAddr, tokenId)
            ).to.changeTokenBalance(contract, randomAddr, 1);
        });

        it("mint to the zero address should revert", async () => {
            const tokenId = 1;

            await expect(
                contract.connect(owner).mint(ZeroAddress, tokenId)
            ).to.be.revertedWith("ERC721: mint to the zero address");
        });

        it("mint repeated tokenId should revert", async () => {
            const tokenId = 1;

            // first mint
            await contract.connect(owner).mint(randomAddr, tokenId)

            // sencond
            await expect(
                contract.connect(owner).mint(randomAddr, tokenId)
            ).to.be.revertedWith("ERC721: token already minted");
        });
    })
});