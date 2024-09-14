const { expect } = require('chai');
const { ethers } = require('hardhat');
// const hardhat = require('hardhat');

let contractInstance;
let accounts = [];
let owner;

async function init() {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    contractInstance = await ethers.deployContract("BytesAddition");
    // console.log('====contract address====', await contractInstance.getAddress());
}

describe('BytesAddition', () => {

    before(async () => {
        await init();
    });

    it('addBytes', async () => {

        let cases = [
            // {
            //     'input1': '0x82134f64c79de175223caf5e8b9a0c7da1ec18f78a25374a60b96695076e4efa6382c9106f5d80bbd7134756294182ca4fd51789553c3d2a21051e590a189832',
            //     'input2': '0xac12f9be0d35a8e716f34c6d970e57f314820bcad1cb9c5b',
            //     'expected': '0x012e264922d4d38a5c392ffbcc22a86470b66e24c25bf0d3a560b96695076e4efa6382c9106f5d80bbd7134756294182ca4fd51789553c3d2a21051e590a189832',
            // }
            {
                'input1': '0x872bdacf50e13a46cb80f8ab5fd71459',
                'input2': '0x872bdacf50e13a46cb80f8ab5fd71459',
                'expected': '0x010e57b59ea1c2748d9701f156bfae28b2',
            }
            // input1: 0x82134f64c79de175223caf5e8b9a0c7da1ec18f78a25374a60b96695076e4efa6382c9106f5d80bbd7134756294182ca4fd51789553c3d2a21051e590a189832
            // input2: 0xac12f9be0d35a8e716f34c6d970e57f314820bcad1cb9c5b
            // expected: 0x012e264922d4d38a5c392ffbcc22a86470b66e24c25bf0d3a560b96695076e4efa6382c9106f5d80bbd7134756294182ca4fd51789553c3d2a21051e590a189832
            // actual:   0x82134f64c79de175223caf5e8b9a0c7da1ec18f78a25374a60b96695076e4efa6382c9106f5d80bbd7134756294182ca4fd51789553c3d2a21051e590a189832ac12f9be0d35a8e716f34c6d970e57f314820bcad1cb9c5b00000000000000000000000000000000000000000000000000000000000000000000000000000000
            // test 3
            // input1: 0x872bdacf50e13a46cb80f8ab5fd71459
            // input2: 0x872bdacf50e13a46cb80f8ab5fd71459
            // expected: 0x010e57b59ea1c2748d9701f156bfae28b2
            // actual:   0x872bdacf50e13a46cb80f8ab5fd71459872bdacf50e13a46cb80f8ab5fd71459
            // test 4
            // input1: 0x7268491fba3d5e92c0f07b386a50ed
            // input2: 0xb2eac94d3f8a72cbe15d9067f1abce08d726d6c3026da6d5b3d22d
            // expected: 0x012553126cf9c7d15ea24e0ba05bfcbb08d726d6c3026da6d5b3d22d
            // actual:   0x7268491fba3d5e92c0f07b386a50ed000000000000000000000000b2eac94d3f8a72cbe15d9067f1abce08d726d6c3026da6d5b3d22d
            // test 5
            // input1: 0x3f2d81a4e9bc7d0615eac692ab903a11
            // input2: 0x9efb3c6a24d7e8bfc59312a6
            // expected: 0xde28be0f0e9465c5db7dd938ab903a11
            // actual:   0x3f2d81a4e9bc7d0615eac692ab903a119efb3c6a24d7e8bfc59312a600000000
            // test 6
            // input1: 0x50938e6ab9d5e4f0c1c8437f04e75b4083d0b36f59431c08a4c6a55404c44b484eb1576665bc30e9d0078e
            // input2: 0xd3f50845a2e719cb17d87bc647b201a6d19992d74d24d3927f8e011b23bbfec93836b0e0f394d28c64a2e8314f
            // expected: 0x01248896b05cbcfebbd9a0bf454c995ce7556a4646a667ef9b2454a66f28804a1186e808475951037634aa76314f
            // actual:   0x50938e6ab9d5e4f0c1c8437f04e75b4083d0b36f59431c08a4c6a55404c44b484eb1576665bc30e9d0078e0000d3f50845a2e719cb17d87bc647b201a6d19992d74d24d3927f8e011b23bbfec93836b0e0f394d28c64a2e8314f
            // test 7
            // input1: 0x5a3e1b7c9f80d62a1e5f
            // input2: 0xc0b6f497e83a162d7f2c
            // expected: 0x011af5101487baec579d8b
            // actual:   0x5a3e1b7c9f80d62a1e5fc0b6f497e83a162d7f2c
        ]

        for (let item of cases) {
            // const p1 = ethers.getBigInt(item.input1);
            // const p2 = ethers.getBigInt(item.input2);
            // const p3 = p1 + p2;
            // const p4 = p3.toString(16);
            // console.log({ p1, p2, p3, p4})

            // const p4 = p3.toString(16);
            // const p5 = ethers.getBigInt('0x010e57b59ea1c2748d9701f156bfae28b2');
            // console.log({ p1, p2, p3, p4, p5 });

            await contractInstance.addBytes(item.input1, item.input2);
            const result = await contractInstance.sum();
            console.log(result);
            expect(result).to.be.equal(item.expected);
        }
    });
});