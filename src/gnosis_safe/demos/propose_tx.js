require('dotenv').config();
const Safe = require('@safe-global/protocol-kit').default;
const { ethers, Wallet } = require('ethers');
const SafeApiKit = require('@safe-global/api-kit').default;


async function main() {
  const signerPrivateKey = String(process.env.OWNER_1_PRIVATE_KEY); // 替换为多签钱包拥有者之一的私钥
  const safeAddress = String(process.env.SAFE_ADDRESS); // 替换为你的多签钱包地址
  const PROVIDER_URL = process.env.PROVIDER_URL;

  const safeWallet = await Safe.init({
    provider: PROVIDER_URL,
    signer: signerPrivateKey,
    safeAddress: safeAddress
  })

  const safeTransactionData = {
    to: '0x4f079f4B06391Beb2928294238f999627CE9fc61', // 任何地址均可
    data: '0x',
    value: ethers.parseUnits('0.001', 'ether').toString()
  }

  // 创建 Safe transaction
  const safeTransaction = await safeWallet.createTransaction({ 'transactions': [safeTransactionData] });

  // 交易参数哈希
  const safeTxHash = await safeWallet.getTransactionHash(safeTransaction);

  // 对交易进行签名
  const senderSignature = await safeWallet.signHash(safeTxHash);

  const apiKit = new SafeApiKit({
    chainId: await safeWallet.getChainId(),
  })

  // 提交交易到 Safe 服务（这样，其他钱包 owner 可以在 Safe 网站中看到待签名的交易）
  await apiKit.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: new Wallet(signerPrivateKey).address,
    senderSignature: senderSignature.data,
  })
}


main().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
})
