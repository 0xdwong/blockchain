# sol2uml

## 主要功能
- Solidity 合约的统一建模语言（UML）类图生成器
- 合同存储布局图
- 将类似于Etherscan的浏览器上的 Solidity 文件转存到本地文件
- 在类似Etherscan的浏览器上查看不同的合约


## 使用

### flatten
npx sol2uml flatten 0xd8cbccf15f92865c400a2c1896b7f06e45ea5616 -n goerli

### diff
npx sol2uml diff -s -n goerli 0xab52c564a46d4a9e1114bf4b2b3c57e83a03b044 . -k ZVGJ95QNG19RPD8UXU6RYM8PKP2IBH61JG