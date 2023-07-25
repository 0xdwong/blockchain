# ERC-55
EIP-55: 混合大小写校验地址编码，目的是地址输入错误，改进地址验证的可靠性。

具体规则如下：  
将地址转换为十六进制，但如果它的第 i 位是字母（即 abcdef 之一）则有：如果小写的十六进制地址的哈希值的第i*4 位为 1，则大写形式打印，否则小写形式打印。

## 测试脚本
[checksum.js](./checksum.js)  
```
yarn install
node checksum.js
```

## 参考资料
- https://eips.ethereum.org/EIPS/eip-55