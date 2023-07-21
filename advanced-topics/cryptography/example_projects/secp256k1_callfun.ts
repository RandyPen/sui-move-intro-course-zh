import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { Secp256k1Keypair, JsonRpcProvider, testnetConnection, RawSigner, TransactionBlock } from 'npm:@mysten/sui.js';


const env = loadEnvSync();
const secret_key_mnemonics = env.SECRET_KEY_SECP256K1_1_MNEMONICS;
const keypair = Secp256k1Keypair.deriveKeypair(secret_key_mnemonics);
const address = keypair.getPublicKey().toSuiAddress();

// connect to TestNet
const provider = new JsonRpcProvider(testnetConnection);
const packageObjectId = '0x277ffe8d7c082864aeaa0439fd7129ce3e604dab223674de29449792296d2163';
const signer = new RawSigner(keypair, provider);
try {
    const tx = new TransactionBlock();
    // public entry fun mint(
    //     name: vector<u8>
    //     image_url: vector<u8>
    //     recipient: Option<address> tx.pure([]) | tx.pure(['0x...'])
    // )
    tx.moveCall({
        target: `${packageObjectId}::nft::mint`,
        arguments: [tx.pure('ikunidol.com'), tx.pure('https://pdan.cdn.dfyun.com.cn/pdan1/2023/0629/7.jpg'), tx.pure([address])],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log({ result });
} catch (error) {
	console.error('Error call function:', error);
}

