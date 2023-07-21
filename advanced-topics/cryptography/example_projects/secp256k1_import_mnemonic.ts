import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { Secp256k1Keypair } from 'npm:@mysten/sui.js';


const env = loadEnvSync();
const secret_key_mnemonics = env.SECRET_KEY_SECP256K1_1_MNEMONICS;
const keypair = Secp256k1Keypair.deriveKeypair(secret_key_mnemonics);
console.log(keypair.getPublicKey().toSuiAddress())
