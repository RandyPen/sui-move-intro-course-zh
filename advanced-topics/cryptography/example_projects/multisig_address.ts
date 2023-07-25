import { loadSync as loadEnvSync } from "https://deno.land/std/dotenv/mod.ts"
import { Ed25519Keypair, Secp256k1Keypair, Secp256r1Keypair, MultiSigPublicKey } from 'npm:@mysten/sui.js';


const env = loadEnvSync();

const ed25519_secret_key_mnemonics = env.SECRET_KEY_ED25519_1_MNEMONICS;
const k1 = Ed25519Keypair.deriveKeypair(ed25519_secret_key_mnemonics);
const pk1 = k1.getPublicKey();

const secp256k1_secret_key_mnemonics = env.SECRET_KEY_SECP256K1_1_MNEMONICS;
const k2 = Secp256k1Keypair.deriveKeypair(secp256k1_secret_key_mnemonics);
const pk2 = k2.getPublicKey();

const secp256r1_secret_key_mnemonics = env.SECRET_KEY_SECP256R1_1_MNEMONICS;
const k3 = Secp256r1Keypair.deriveKeypair(secp256r1_secret_key_mnemonics);
const pk3 = k3.getPublicKey();

const multiSigPublicKey = MultiSigPublicKey.fromPublicKeys({
    threshold: 3,
    publicKeys: [
        { publicKey: pk1, weight: 1 },
        { publicKey: pk2, weight: 2 },
        { publicKey: pk3, weight: 3 },
    ],
});

console.log(multiSigPublicKey.toSuiAddress());
