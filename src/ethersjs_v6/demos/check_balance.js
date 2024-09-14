require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

async function checkBalance(address) {
    let lastBalance = BigInt(0);

    setInterval(async () => {
        const currentBalance = await provider.getBalance(address);
        if (currentBalance != lastBalance) {
            console.log(`Balance updated: ${ethers.formatEther(currentBalance)} ETH`);
            lastBalance = currentBalance;
        }
    }, 60 * 1000); // 每分钟检查一次
}

async function main() {
    const address = '';
    await checkBalance(address);
}

main();