import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { Ed25519Keypair } from 'npm:@mysten/sui.js';


const env = loadEnvSync();
const secret_key_mnemonics = env.SECRET_KEY_ED25519_1_MNEMONICS;
const keypair = Ed25519Keypair.deriveKeypair(secret_key_mnemonics);
console.log(keypair.getPublicKey().toSuiAddress())
