import { Metaplex, keypairIdentity, token, bundlrStorage, toMetaplexFile } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import bip39 from "bip39";
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config();


async function init() {
    const connection = new Connection(clusterApiUrl("devnet"));
    const mnemonic = process.env.mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
    const wallet = Keypair.fromSeed(seed.slice(0, 32));

    const publicKey = wallet.publicKey;
    console.log('publicKey', publicKey.toString());

    // const balance = await connection.getBalance(publicKey);
    let metaplex = new Metaplex(connection)
        .use(keypairIdentity(wallet))
        .use(
            bundlrStorage({
                address: "https://devnet.bundlr.network",
                providerUrl: "https://api.devnet.solana.com",
                timeout: 60000,
            })
        );
    return metaplex;
}


async function create() {
    const metaplex = await init();
    const { nft } = await metaplex.nfts().create({
        // uri: "https://arweave.net/fabEf9VKPJumMc1nI9S6ZwZTQZGgpUxXf7WLSaW9enQ",
        uri: "https://arweave.net/yVg2882j8IofTKgqemYZ62Cy5-NGK_1z7FRd_kxifJU",
        name: "MYNFT-1",
        symbol: "MYNFT",
        sellerFeeBasisPoints: 0, // Represents 5.00%.
        mintTokens: true,
        // tokenStandard: 'NonFungibleEdition',
        // isCollection: true,
        // collection: null
    },
        { commitment: "finalized" }
    );

    console.log('====nft====', nft.mint.address.toBase58());
    return nft.mint.address.toBase58();
}

async function airdrop() {
    const addresses = [
        // 'FNKr6azjeDaNRdxqFeUd7qa9Qvt38DiWG6vV82TTc14b',
        '3x3iBcaVryUmEQAhuVPuYNcrk4jSZMQY91FnRRC1KHk2',
    ];

    for (let address of addresses) {
        await _airdrop(address);
    }
}

async function _airdrop(toAddr) {
    // 创建NFT
    const NFTAddr = await create();

    // 空投NFT    
    const mnemonic = process.env.mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
    const wallet = Keypair.fromSeed(seed.slice(0, 32));

    const SOLANA_CONNECTION = new Connection(clusterApiUrl("devnet"), 'confirmed');
    const transferAmount = 1

    console.log(`Sending ${transferAmount} ${(NFTAddr)} to ${(toAddr)}.`)

    //Step 1
    console.log(`1 - Getting Source Token Account`);

    let sourceAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        wallet,
        new PublicKey(NFTAddr),
        wallet.publicKey
    );

    console.log(`Source Account: ${sourceAccount.address.toString()}`);

    //Step 2
    console.log(`2 - Getting Destination Token Account`);
    let destinationAccount = await getOrCreateAssociatedTokenAccount(
        SOLANA_CONNECTION,
        wallet,
        new PublicKey(NFTAddr),
        new PublicKey(toAddr)
    );
    console.log(`Destination Account: ${destinationAccount.address.toString()}`);

    //Step 3
    console.log(`3 - Creating and Sending Transaction`);
    const tx = new Transaction();
    tx.add(createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        wallet.publicKey,
        transferAmount
    ))

    const signature = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [wallet]);
    console.log('====signature====', signature)
}


async function mint() {
    const metaplex = await init();
    const mintAddress = new PublicKey('2bARbvLRLsrW7tSrdxGtmmT6ttaBeQKVLB4diDLe3idW');
    const nft = await metaplex.nfts().findByMint({ mintAddress });

    const params = {
        nftOrSft: nft,
        toOwner: new PublicKey('FNKr6azjeDaNRdxqFeUd7qa9Qvt38DiWG6vV82TTc14b'),
        amount: token(1)
    }
    const nfts = metaplex.nfts();
    const result = await nfts.mint(params);
    console.log('====mint====', result);
}

async function uploadMetadata() {
    const metaplex = await init();

    const { uri } = await metaplex.nfts().uploadMetadata({
        "name": "My NFT2",
        "symbol": "MyNFT2",
        "description": "My NFT2 description",
        "image": "https://arweave.net/UJAtGGROBCiZV7pb7CUO1CMDCneNBhD9-a5z7QR8jXM",
        "attributes": {
            "challenge_ipfs_url": "ipfs://QmQeQ9AhSdEc8uLQUCs9rmQ5r7e6ojso7qFtaJpqf3vZNR",
            "challenge_url": "https://decert.me/quests/f34f27f9-f8a9-41bd-bf4b-b99a29cb35f3",
            "challenge_title": "链上数据训练营 L2",
            "difficulty": 1
        },
        "external_url": "https://decert.me",
        "version": 1.1
    }
    );
    console.log('====uri====', uri);
}

async function uploadFile() {
    const metaplex = await init();

    const imageFile = 'test.png';
    // 将文件读取为缓冲区
    const buffer = fs.readFileSync(imageFile)
    // 将缓冲区转换为 Metaplex 文件
    const file = toMetaplexFile(buffer, imageFile)

    console.log('====uploading====');
    const uri = await metaplex.storage().upload(file)
    console.log('====uri====', uri);
}

async function findByMint() {
    const metaplex = await init();
    const mintAddress = new PublicKey('2bARbvLRLsrW7tSrdxGtmmT6ttaBeQKVLB4diDLe3idW');
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    console.log(nft);

}

async function main() {
    await init();
    // await create();
    // await mint();
    // await findByMint();
    // await uploadMetadata();
    // await uploadFile();
    // await airdrop();
}

main().then(() => {
    console.log('succeed');
    process.exit(0)
}).catch(err => {
    console.error(err);
    process.exit(1)
})