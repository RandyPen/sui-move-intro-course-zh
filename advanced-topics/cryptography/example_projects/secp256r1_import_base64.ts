import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { Secp256r1Keypair, fromB64 } from 'npm:@mysten/sui.js';


const env = loadEnvSync();
const PRIVATE_KEY_SIZE = 32;
const secret_key_base64 = env.SECRET_KEY_SECP256R1_1_B64;
const raw = fromB64(secret_key_base64);
// The secp256r1 flag is 0x02. See more at https://docs.sui.io/learn/cryptography/sui-signatures
if (raw[0] !== 2 || raw.length !== PRIVATE_KEY_SIZE + 1) {
    throw new Error('invalid key');
}
const keypair = Secp256r1Keypair.fromSecretKey(raw.slice(1));
console.log(keypair.getPublicKey().toSuiAddress())
