require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; //usdt
const abi = [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
]; // 合约ABI

const contract = new ethers.Contract(contractAddress, abi, provider);

contract.on("Transfer", (from, to, value, event) => {
    console.log("Transfer event detected!");
    console.log("From:", from);
    console.log("To:", to);
    console.log("Value:", ethers.formatUnits(ethers.getBigInt(value), 6)); // USDT 使用 6 位小数
    console.log("Hash:", event.log.transactionHash);
    console.log("\n");
});

console.log("Listening for ERC20 Transfer events...");