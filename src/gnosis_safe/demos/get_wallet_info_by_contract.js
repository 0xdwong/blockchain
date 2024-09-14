require('dotenv').config();
const { ethers } = require('ethers');

// 连接到以太坊网络
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

// Gnosis Safe ABI (简化版)
const safeAbi = [
    "function getThreshold() view returns (uint256)",
    "function getOwners() view returns (address[])",
    "function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures) payable returns (bool success)"
];

// Gnosis Safe 合约地址
const safeAddress = '0x14EB509DcBaB0e4032DDe626834AfB44fEc3Ed70'; // 替换为实际的 Safe 地址

// 创建合约实例
const safeContract = new ethers.Contract(safeAddress, safeAbi, provider);

async function getSafeInfo() {
    const threshold = await safeContract.getThreshold();
    const owners = await safeContract.getOwners();

    console.log(`Threshold: ${threshold}`);
    console.log(`Owners: ${owners.join(', ')}`);
}

getSafeInfo();