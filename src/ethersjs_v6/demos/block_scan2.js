require('dotenv').config();
const { ethers } = require('ethers');

// 监控地址
const ADDRESS_TO_MONITOR = "0xC27018ca6c6DfF213583eB504df4a039Cc7d8043";

// 初始化 provider
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

async function scanBlocks() {
    let lastCheckedBlock = await provider.getBlockNumber();

    setInterval(async () => {
        const currentBlockNumber = await provider.getBlockNumber();

        if (currentBlockNumber > lastCheckedBlock) {
            for (let i = lastCheckedBlock + 1; i <= currentBlockNumber; i++) {
                const block = await provider.getBlock(i, true);

                block.prefetchedTransactions.forEach(tx => {
                    // 检查交易中的发送或接收地址

                    if (tx.from === ADDRESS_TO_MONITOR || tx.to === ADDRESS_TO_MONITOR) {
                        console.log(`tx: ${tx.hash}`, {from:tx.from, to:tx.to, value:tx.value,data:tx.data},'\n');
                        console.log(`检测到相关交易: ${tx.hash}`);
                        // 进一步处理
                    }
                });
            }
            lastCheckedBlock = currentBlockNumber;
        }
    }, 12 * 1000); // 每 12 秒检查一次
}

scanBlocks();