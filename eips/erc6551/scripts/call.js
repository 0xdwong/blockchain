require("dotenv").config();
const { ethers } = require("ethers");
const ERC6551_ADDRESS = "0x6520228d12F2D3966B8FDCB107E1a13E48dd3FEc";
const ERC6551_ABI = `
[
    "function executeCall(address, uint256, bytes) external payable returns(bytes)",
    "function owner() external view returns(address)",
    "function token() external view returns (uint256,address,uint256)"
]
`;

let erc6551Instance;
let  wallet;
const receiver = "0x2211dE1b3F96768882dcC691b6f01A29D4e85025"

const PROVIDER_URL = process.env.PROVIDER_URL;
let provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);

async function init() {
    wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC, "m/44'/60'/0'/0/0").connect(provider);
    
    console.log('====wallet address----', wallet.address);
    console.log('====receiver address----', receiver);

    erc6551Instance = new ethers.Contract(ERC6551_ADDRESS, ERC6551_ABI);
}


async function sendETH() {
    // sendETH
    const to = receiver;
    const value = ethers.utils.parseEther("0.01");
    const data = '0x'
 
    const receipt = await erc6551Instance.connect(wallet).executeCall(to, value, data);

    console.log('====sendETH succeed====', receipt.hash);
}

async function owner() {
    const owner = await erc6551Instance.connect(wallet).owner();
    console.log('====owner====', owner);
}

async function token() {
    const token = await erc6551Instance.connect(wallet).token();
    console.log('====owner====', token);
}

async function main() {
    await init();
    // await sendETH();
    await owner();
    // await token();

}

main()