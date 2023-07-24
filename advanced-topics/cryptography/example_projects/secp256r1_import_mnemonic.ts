import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { Secp256r1Keypair } from 'npm:@mysten/sui.js';


const env = loadEnvSync();
const secret_key_mnemonics = env.SECRET_KEY_SECP256R1_1_MNEMONICS;
const keypair = Secp256r1Keypair.deriveKeypair(secret_key_mnemonics);
console.log(keypair.getPublicKey().toSuiAddress())
