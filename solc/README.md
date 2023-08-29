# solc

## 安装
不同环境份安装教程：https://docs.soliditylang.org/en/latest/installing-solidity.html

MAC 安装 solc 教程（通过Homebrew安装）：
```
brew update
brew upgrade
brew tap ethereum/ethereum
brew install solidity
```

## 使用
### 查看版本号
`solc --version` 或者 `solc -V`

运行`solc --help`，查看更多参数选项


### 编译合约
运行以下命令，打印出二进制代码
`solc --bin xxx.sol` 

### 标准输入和输出 JSON
与 Solidity 编译器进行接口交互的推荐方式，尤其是对于更复杂和自动化的设置

常见参数见： [input.json](./input.json)

完整版参数见：https://docs.soliditylang.org/en/v0.8.21/using-the-compiler.html#compiler-input-and-output-json-description

通过标准输入编译合约，生成标准输出
```
solc  --standard-json ./input.json > output.json
```

