import { Ed25519KeyPair, keyUtils } from '@transmute/did-key-ed25519';
import base64url from 'base64url';
import bs58 from 'bs58';
//import { CryptoLD } from 'crypto-ld';
import crypto from 'crypto';
import { JsonWebKey, PublicKey } from './@types';

export const privateKeyJwkFromPrivateKeyBase58 = keyUtils.privateKeyJwkFromPrivateKeyBase58;

export const KEY_TYPE = 'Ed25519VerificationKey2018';

export async function createEd25519VerificationKey(seed?: Uint8Array): Promise<Ed25519KeyPair> {
  const edKeyPair = await Ed25519KeyPair.generate({
    secureRandom: () => (seed ? seed : crypto.randomBytes(32))
  });

  return edKeyPair;
}

/**
 *
 * @param PublicKey publicKey the controlled public key from registry
 * @param string privateKey the private key in base58 or JWK
 */
export function recoverEd25519KeyPair(key: PublicKey, privateKey?: string | JsonWebKey): Ed25519KeyPair {
  if (key.publicKeyJwk) {
    return Ed25519KeyPair.from({
      ...key,
      publicKeyJwk: key.publicKeyJwk,
      privateKeyJwk: privateKey
    });
  } else {
    // ethr-did-registry only stores keys as base64 or hex, so we must transcode it first
    if (key.publicKeyBase64) {
      key.publicKeyBase58 = bs58.encode(Buffer.from(key.publicKeyBase64, 'base64'));
    }

    if (key.publicKeyBase58) {
      return Ed25519KeyPair.from({
        ...key,
        publicKeyBase58: key.publicKeyBase58,
        privateKeyBase58: privateKey as string
      });
    }
    throw Error('no compatible public key found');
  }
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
