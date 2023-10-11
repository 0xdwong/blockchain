import { Metaplex, keypairIdentity, toMetaplexFile, bundlrStorage } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import ed25519 from "ed25519-hd-key";
import bip39 from "bip39";
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config();


function getSignerPrivateKey(privateKey) {
    const signer = Keypair.fromSecretKey(bs58.decode(privateKey));
    return signer;
}

function getSignerFromMnemonic(mnemonic) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
    const derivePath = "m/44'/501'/0'/0'"
    const derivedSeed = ed25519.derivePath(derivePath, seed.toString('hex')).key
    const signer = Keypair.fromSeed(derivedSeed);
    return signer;
}

async function init() {
    const cluster = process.env.Solana_Cluster || 'devnet'; // or mainnet-beta | testnet
    const connection = new Connection(clusterApiUrl(cluster));
    let metaplex = new Metaplex(connection);
    return metaplex;
}

async function createCollection() {
    const metaplex = await init();

    const signer = getSignerPrivateKey(process.env.privateKey);
    // 连接 Signer
    metaplex.use(keypairIdentity(signer));

    const { nft } = await metaplex.nfts().create({
        uri: "https://arweave.net/IiKAazQfKN3tYZIRhlEPLxV7whvcYrJ7Q_iOGlhKAVA", // 集合元数据
        name: "My NFT",
        symbol: "MYNFT",
        sellerFeeBasisPoints: 0, // 二次销售版税，默认为250(5%)
        isCollection: true, //是否集合
    },
        { commitment: "finalized" }
    );

    console.log('====nft collection address====', nft.mint.address.toBase58());
    return nft.mint.address.toBase58();
}

async function mint() {
    const metaplex = await init();

    const signer = getSignerPrivateKey(process.env.privateKey);
    // 连接 Signer
    metaplex.use(keypairIdentity(signer));

    const collectionAddr = ''; // NFT 集合地址
    const receiver = ''; // 接收者地址

    const { nft } = await metaplex.nfts().create({
        uri: "https://arweave.net/nJiWU0MEM4axyuN5Pa7wvNF63xFDqOWatFA1HqlCuCw",//NFT元数据
        name: "My NFT",
        symbol: "MYNFT",
        tokenOwner: new PublicKey(receiver),
        sellerFeeBasisPoints: 0, // 二次销售版税，默认为250(5%)
        collection: new PublicKey(collectionAddr),
        collectionAuthority: signer, // 验证者，用于验证是否属于该合集，也可在创建 NFT 后再验证
    },
        { commitment: "finalized" }
    );

    console.log('====nft====', nft.mint.address.toBase58());
    return nft.mint.address.toBase58();
}

async function verifyCollection() {
    const metaplex = await init();
    const signer = getSignerPrivateKey(process.env.privateKey);
    // 连接 Signer
    metaplex.use(keypairIdentity(signer));

    const collectionAddr = ''
    const nftAddr = ''

    await metaplex.nfts().verifyCollection({
        mintAddress: new PublicKey(nftAddr),
        collectionMintAddress: new PublicKey(collectionAddr),
        isSizedCollection: true,
    })
}

async function burn() {
    const metaplex = await init();

    // 连接 Signer
    const signer = getSignerPrivateKey(''); // NFT owner's privateKey
    metaplex.use(keypairIdentity(signer));

    const collectionAddr = '';
    const nftAddr = '';
    const mintAddress = new PublicKey(nftAddr);

    const params = {
        mintAddress: mintAddress,
        // authority: signer,
        collection: new PublicKey(collectionAddr),
    }
    const result = await metaplex.nfts().delete(params);
    console.log('====burn====', result)
}

async function freeze() {
    const metaplex = await init();
    const signer = getSignerPrivateKey();

    const nftAddr = '';
    const mintAddress = new PublicKey(nftAddr);

    const ownerAddr = '';
    const tokenOwner = new PublicKey(ownerAddr);

    const result = await metaplex.nfts().freezeDelegatedNft({ mintAddress, 'delegateAuthority': signer, tokenOwner });
    console.log('====freeze====', result)
}

async function uploadFile() {
    const metaplex = await init();
    const signer = getSignerPrivateKey(process.env.privateKey);
    metaplex
        .use(keypairIdentity(signer))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            })
        );

    const imageFile = 'mynft.png';
    // 将文件读取为缓冲区
    const buffer = fs.readFileSync(imageFile)
    // 将缓冲区转换为 Metaplex 文件
    const file = toMetaplexFile(buffer, imageFile)

    console.log('====uploading====');
    const uri = await metaplex.storage().upload(file)
    console.log('====uri====', uri);
}

async function uploadMetadata() {
    const metaplex = await init();
    const signer = getSignerPrivateKey(process.env.privateKey);
    metaplex
        .use(keypairIdentity(signer))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                timeout: 60000,
            })
        );

    const { uri } = await metaplex.nfts().uploadMetadata({
        "name": "My NFT#1",
        "symbol": "MYNFT",
        "description": "My NFT create by Metaplex",
        "image": "https://arweave.net/uMEl7Ps5PNzY7T6V0F6lg3Q36CZSXeOjdPM2WXTAfio",
        "attributes": {
            "level": 1,
            "rare": false
        },
        "external_url": "",
        "version": 1.0
    }
    );
    console.log('====uri====', uri);
}

async function main() {
    // await createCollection();
    // await mint();
    // await burn();
    // await freeze();
    // await verifyCollection();
    // await uploadFile();
    // await uploadMetadata();
}

main().then(() => {
    console.log('succeed');
    process.exit(0)
}).catch(err => {
    console.error(err);
    process.exit(1)
})