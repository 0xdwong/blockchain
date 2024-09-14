require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

// USDT 合约地址（以太坊主网）
const USDT_CONTRACT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// 替换为你想要监控的以太坊地址列表
const ADDRESSES_TO_MONITOR = [
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
    // 添加更多地址...
];


// 设置扫块间隔（毫秒）
const POLLING_INTERVAL = 15000; // 15秒

// USDT 合约 ABI（包含 Transfer 事件和 balanceOf 函数）
const USDT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "name": "from", "type": "address" },
            { "indexed": true, "name": "to", "type": "address" },
            { "indexed": false, "name": "value", "type": "uint256" }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    }
];

async function monitorUSDTBalances() {
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);

    console.log("开始监控以下地址的 USDT 余额变化:");
    ADDRESSES_TO_MONITOR.forEach(address => console.log(address));

    let lastCheckedBlock = await provider.getBlockNumber();

    while (true) {
        try {
            const latestBlock = await provider.getBlockNumber();

            console.log({ lastCheckedBlock, latestBlock });


            if (latestBlock > lastCheckedBlock) {
                console.log(`扫描区块 ${lastCheckedBlock + 1} 到 ${latestBlock}`);

                const events = await usdtContract.queryFilter('Transfer', lastCheckedBlock + 1, latestBlock);

                for (const event of events) {
                    const { from, to, value } = event.args;

                    if (ADDRESSES_TO_MONITOR.includes(from) || ADDRESSES_TO_MONITOR.includes(to)) {
                        const address = ADDRESSES_TO_MONITOR.includes(from) ? from : to;
                        const balance = await usdtContract.balanceOf(address);
                        const formattedBalance = ethers.formatUnits(balance, 6); //usdt decimal
                        console.log(`地址 ${address} 的新 USDT 余额: ${formattedBalance} USDT`);
                    }
                }

                lastCheckedBlock = latestBlock;
            }

            // 等待一段时间后再次检查
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        } catch (error) {
            console.error("监控过程中出错:", error);
            // 出错后等待一段时间再重试
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        }
    }
}

async function main() {
    await monitorUSDTBalances();
}

main();