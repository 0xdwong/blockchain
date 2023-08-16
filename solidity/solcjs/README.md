# solcjs demo

## 简介 
[solc-js](https://github.com/ethereum/solc-js) 是一个 JavaScript 库，为 Solidity 编译器提供绑定。它允许开发人员将 Solidity 智能合约编译为可以部署在以太坊区块链上的字节码。


## 安装依赖
```
yarn install
```

## 使用
### 编译合约  
运行以下命令，将生成 abi 和字节码文件  
`npx solcjs --bin --abi Simple.sol`

### 高级API - compile
通过编译器标准格式输入合约数据，生成标准输出格式文件。详情见[编译器标准输入输出](https://solidity.readthedocs.io/en/v0.5.0/using-the-compiler.html#compiler-input-and-output-json-description)  
`node test.js`
    
## 参考
- [solc-js](https://github.com/ethereum/solc-js)