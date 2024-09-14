require('dotenv').config();
const Safe = require('@safe-global/protocol-kit').default;
const SafeApiKit = require('@safe-global/api-kit').default;


async function main() {
  // params
  const privateKey = String(process.env.OWNER_2_PRIVATE_KEY); // 替换为多签钱包拥有者之一的私钥
  const safeAddress = String(process.env.SAFE_ADDRESS); // 替换为你的多签钱包地址
  const PROVIDER_URL = process.env.PROVIDER_URL;

  const safeWallet = await Safe.init({
    provider: PROVIDER_URL,
    signer: privateKey,
    safeAddress: safeAddress
  })

  const apiKit = new SafeApiKit({
    chainId: await safeWallet.getChainId(),
  })

  const pendingTransactions = (await apiKit.getPendingTransactions(safeAddress)).results;

  const transaction = pendingTransactions[0];
  if (!transaction) {
    console.log('没有待签名的交易');
    return;
  }

  const safeTxHash = transaction.safeTxHash;

  const signature = await safeWallet.signHash(safeTxHash);
  const response = await apiKit.confirmTransaction(safeTxHash, signature.data);
  console.log('已确认交易:\n', response);
}


main().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
})