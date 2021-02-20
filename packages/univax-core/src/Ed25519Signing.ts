import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import base64url from 'base64url';
import bs58 from 'bs58';
//import { CryptoLD } from 'crypto-ld';
import crypto from 'crypto';
import { PublicKey } from 'did-resolver';

export async function createEd25519VerificationKey(seed?: Uint8Array): Promise<Ed25519KeyPair> {
  const edKeyPair = await Ed25519KeyPair.generate({
    secureRandom: () => (seed ? seed : crypto.randomBytes(32))
  });

  return edKeyPair;
}

/**
 * ethr-did-registry only stores keys as base64 or hex, so we must
 * convert it first
 *
 * @param PublicKey publicKey the controlled public key from registry
 * @param string privateKey the private key in base58
 */
export function recoverEd25519KeyPair(key: PublicKey, privateKeyBase58?: string): Ed25519KeyPair {
  let publicKeyBase58 = key.publicKeyBase58;
  if (!publicKeyBase58) {
    if (key.publicKeyBase64) {
      publicKeyBase58 = bs58.encode(Buffer.from(key.publicKeyBase64, 'base64'));
    } else {
      throw Error('no compatible public key found');
    }
  }

  const keyConfig = {
    ...key,
    publicKeyBase58,
    privateKeyBase58
  };

  return Ed25519KeyPair.from(keyConfig);
}

/**
 * tried
 * https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/JwsLinkedDataSignature.js
 *
 * but gave up and went with the plain idea:
 * http://www.davedoesdev.com/json-web-signatures-on-node-js/
 */
export async function signJws(message: string, keyPair: Ed25519KeyPair): Promise<string> {
  const signer = keyPair.signer();

  const header = {
    alg: 'EdDSA',
    b64: false, //todo: figure out if that should be true...
    crit: ['b64']
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedData = base64url(message);
  const payload = Buffer.from(`${encodedHeader}.${encodedData}`, 'utf-8');

  const signature = await signer.sign({ data: payload });
  const encodedSignature = base64url(<Buffer>signature);

  const jws = encodedHeader + '..' + encodedSignature;
  return jws;
}

export async function verifyJws(data: string, keyPair: Ed25519KeyPair, jws: string): Promise<boolean> {
  const verifier = keyPair.verifier();

  const [encodedHeader, , encodedSignature] = jws.split('.');
  const signature = base64url.toBuffer(encodedSignature);

  const encodedData = base64url(data);
  const payload = Buffer.from(`${encodedHeader}.${encodedData}`, 'utf-8');

  return verifier.verify({ data: payload, signature });
}