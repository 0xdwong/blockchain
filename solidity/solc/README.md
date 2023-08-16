# solc

## 安装
### MAC 安装 solc
https://docs.soliditylang.org/en/v0.8.17/installing-solidity.html
brew update
brew upgrade
brew tap ethereum/ethereum
brew install solidity

### 切换版本
在Github上查看solidity.rb的提交，复制您想要的版本的提交哈希并在您的机器上检出。
https://github.com/ethereum/homebrew-ethereum/commits/master/solidity.rb

git clone https://github.com/ethereum/homebrew-ethereum.git
cd homebrew-ethereum
git checkout <your-hash-goes-here>

brew unlink solidity

### eg. Install 0.4.8

brew install solidity.rb

## 编译合约
solc -o. --bin --ast-compact-json --asm Simple.sol

solc --pretty-json  -o. --bin --ast-compact-json --asm Simple.sol