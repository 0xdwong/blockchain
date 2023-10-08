import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import ed25519 from "ed25519-hd-key";
import bip39 from "bip39";
import dotenv from "dotenv"
dotenv.config();


function getSigner() {
    const mnemonic = process.env.mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
    const derivePath = "m/44'/501'/0'/0'"
    const derivedSeed = ed25519.derivePath(derivePath, seed.toString('hex')).key
    const signer = Keypair.fromSeed(derivedSeed);

    return signer;
}

async function init() {
    const cluster = process.env.Solana_Cluster || 'devnet';
    const connection = new Connection(clusterApiUrl(cluster));
    const signer = getSigner();
    const publicKey = signer.publicKey;
    const balance = await connection.getBalance(publicKey);
    console.log('publicKey', publicKey.toString(), 'balance', balance);

    let metaplex = new Metaplex(connection)
        .use(keypairIdentity(signer));
    return metaplex;
}

async function createCollection() {
    const metaplex = await init();
    const signer = getSigner();

    const { nft } = await metaplex.nfts().create({
        uri: "https://ipfs.decert.me/QmPzy7pqaEgE1yhuE2om1azS61dfkxRvi26k2TH24VNWXQ",
        name: "Decert Badge",
        symbol: "Decert",
        sellerFeeBasisPoints: 0, // Represents 5.00%.
        // mintTokens: false,
        isCollection: true,
        // collection: signer.publicKey,
    },
        { commitment: "finalized" }
    );

    console.log('====nft====', nft.mint.address.toBase58());
    return nft.mint.address.toBase58();
}

async function mint() {
    const metaplex = await init();
    const signer = getSigner();
    const collectionAddr = '7ekqazG9Cb577zzKBkkzjG9LridTfUt48e5yEf7jiEBX';
    const receiver = '3x3iBcaVryUmEQAhuVPuYNcrk4jSZMQY91FnRRC1KHk2';
    // const receiver = '9yPnwbWtk4FvYMUDjnu6PcnvLGSvoexDSLGRJaFo2BVU'

    const { nft } = await metaplex.nfts().create({
        uri: "https://ipfs.decert.me/QmdGUqSCaxfxL7ZJ2nWdNpkAreeJxRpqFcBEZ9S5RxGEdz",
        name: "区块链技术通识挑战",
        symbol: "Decert",
        tokenOwner: new PublicKey(receiver),
        sellerFeeBasisPoints: 0, // Represents 5.00%.
        collection: new PublicKey(collectionAddr),
        collectionAuthority: signer,
    },
        { commitment: "finalized" }
    );

    console.log('====nft====', nft.mint.address.toBase58());
    return nft.mint.address.toBase58();
}

async function verifyCollection() {
    const metaplex = await init();

    const collectionAddr = 'Ck2CMAYudssLbXgeXAZHfEoNCg9ESxtCPcSy2k2rmhXV'
    const nftAddr = '5itwCy2vTB7RQX2shkgiwcmYqQZ1PT4cEVYTiFN3nfqf'

    await metaplex.nfts().verifyCollection({
        mintAddress: new PublicKey(nftAddr),
        collectionMintAddress: new PublicKey(collectionAddr),
        isSizedCollection: true,
    })
}

async function main() {
    // await init();
    // await createCollection();
    await mint();
    // await verifyCollection();
}

main().then(() => {
    console.log('succeed');
    process.exit(0)
}).catch(err => {
    console.error(err);
    process.exit(1)
})