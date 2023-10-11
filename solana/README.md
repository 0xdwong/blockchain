# Solana


## Demo
使用 Metaplex JS SDK 创建 NFT 和 NFT集合
1. 安装相关依赖
    ```
    yarn add @metaplex-foundation/js @solana/web3.js
    ```

2. 初始化 metaplex
    ```
        const cluster =  'devnet'; // or mainnet-beta | testnet
        const connection = new Connection(clusterApiUrl(cluster));
        let metaplex = new Metaplex(connection);
        return metaplex;
    ```

3. 创建 NFT 合集
    ```
        const { nft } = await metaplex.nfts().create({
            uri: "https://arweave.net/uMEl7Ps5PNzY7T6V0F6lg3Q36CZSXeOjdPM2WXTAfio", // 集合元数据
            name: "My NFT",
            symbol: "MYNFT",
            sellerFeeBasisPoints: 0, // 二次销售版税，默认为250(5%)
            isCollection: true, //是否集合
        },
            { commitment: "finalized" }
        );
    ```
    eg: https://solscan.io/token/4kdj8z7szKpfKEcSaBtQid9c5JAPkjvLLHVqttcYbisc?cluster=devnet

4. 创建 NFT
    ```
        const { nft } = await metaplex.nfts().create({
            uri: "", // NFT元数据
            name: "My NFT",
            symbol: "MYNFT",
            tokenOwner: new PublicKey(''), // 接收者地址
            sellerFeeBasisPoints: 0, // 二次销售版税，默认为250(5%)
            collection: new PublicKey(collectionAddr),
            // collectionAuthority: signer, // 验证者，用于验证是否属于该合集，也可在创建 NFT 后再验证
        },
            { commitment: "finalized" }
        );
    ```
    eg: 
    - [6n6U6S52BNsN3RoFuJ5W5FsSPKx19XGd3KSfqa4XgwQi](https://solscan.io/token/6n6U6S52BNsN3RoFuJ5W5FsSPKx19XGd3KSfqa4XgwQi?cluster=devnet)
    - [F4FeoTbgxRqZZ1CHRdmjQmojbBGwQu1zyuJsojp63qq7](https://solscan.io/token/F4FeoTbgxRqZZ1CHRdmjQmojbBGwQu1zyuJsojp63qq7?cluster=devnet)

完整 demo 见 [nft.js](./demo/nft.js)