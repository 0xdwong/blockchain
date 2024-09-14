require('dotenv').config();
const { Wallet } = require('ethers');
const { SafeFactory } = require('@safe-global/protocol-kit');


async function main() {
  const senderPrivateKey = process.env.OWNER_1_PRIVATE_KEY; // 私钥，用于部署多签钱包合约，该私钥对应的账户不一定是多签的签名者
  const PROVIDER_URL = process.env.PROVIDER_URL;

  const safeFactory = await SafeFactory.init({
    provider: PROVIDER_URL,
    signer: senderPrivateKey,
  })

  // 创建一个 2-3 多签钱包
  const safeAccountConfig = {
    owners: [
      new Wallet(senderPrivateKey).address,
      '0xda32Cc9CeFD48fcCc3E1309c9cd5EcFE452656d0', // 替换地址
      '0xe772A054ced531B10b1f4C25f2Ca5Ca84ef782c9', // 替换地址
    ],
    threshold: 2,
  }

  // 部署多签钱包合约 
  const safeWallet = await safeFactory.deploySafe({ safeAccountConfig });

  const safeAddress = await safeWallet.getAddress();

  console.log('Safe 钱包已部署');
  console.log(`https://app.safe.global/sep:${safeAddress}`);
}

main().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
})

