require('dotenv').config();
const Safe = require('@safe-global/protocol-kit').default;


async function main() {
    const safeAddress = String(process.env.SAFE_ADDRESS); // 替换为实际的多签钱包地址
    const PROVIDER_URL = process.env.PROVIDER_URL; // 替换为实际的 RPC url

    const safeWallet = await Safe.init({
        provider: PROVIDER_URL,
        safeAddress: safeAddress
    })

    const threshold = await safeWallet.getThreshold();
    const owners = await safeWallet.getOwners();

    console.log(`Threshold: ${threshold}`); // 阈值（最小签名数量）
    console.log(`Owners: ${owners.join(', ')}`); // 签名者
}

main();