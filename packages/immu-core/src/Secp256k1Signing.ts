import { ES256K, Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import base64url from 'base64url';
import bs58 from 'bs58';
//import { CryptoLD } from 'crypto-ld';
import crypto from 'crypto';
import { createJWS, SimpleSigner, verifyJWS as didJwtVerifyJWS } from 'did-jwt';
import { PublicKey } from 'did-resolver';
import secp256k1 from 'secp256k1';
import { EthereumPrivateKey } from './Resolver';
import deepEqual from './util/deepEqual';

export async function createVerificationKey(seed?: Uint8Array): Promise<Secp256k1KeyPair> {
  const s256KeyPair = await Secp256k1KeyPair.generate({
    secureRandom: () => (seed ? seed : crypto.randomBytes(32))
  });

  return s256KeyPair;
}

/**
 * @param PublicKey publicKey the controlled public key from registry
 * @param string privateKey the private key in base58
 */
export async function recoverKeyPair(key: PublicKey, privateKeyBase58?: string): Promise<Secp256k1KeyPair> {
  const keyConfig = {
    ...key,
    publicKeyBase58: key.publicKeyBase58 || bs58.encode(Buffer.from(key.publicKeyBase64!, 'base64')),
    privateKeyBase58
  };

  if (!keyConfig.publicKeyBase58) {
    throw new Error('needs a public key');
  }

  return Secp256k1KeyPair.from(keyConfig);
}

export async function verifyJws(message: string, keyPair: Secp256k1KeyPair, jws: string): Promise<boolean> {
  const jwk = keyPair.toJwk();

  //todo: must be canonicalized as in jsonld
  const payload = Buffer.from(message, 'utf-8');
  const verified = ES256K.verifyDetached(jws, payload, jwk);
  return verified;
}

export async function recoverKeyPairFromEthereumAccount(privateKey: EthereumPrivateKey): Promise<Secp256k1KeyPair> {
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const pubKey = secp256k1.publicKeyCreate(privateKeyBuffer);

  const keyConfig = {
    privateKeyBase58: bs58.encode(privateKeyBuffer),
    publicKeyBase58: bs58.encode(pubKey)
  };

  return Secp256k1KeyPair.from(keyConfig);
}

/**
 * tried
 * https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/JwsLinkedDataSignature.js
 *
 * but gave up and went with the plain idea:
 * http://www.davedoesdev.com/json-web-signatures-on-node-js/
 */
export async function signJwsWithPrivateKey(message: string, privateKey: EthereumPrivateKey): Promise<string> {
  // //todo: must be canonicalized as in jsonld
  // const payload = Buffer.from(message, 'utf-8');
  // const signed = await ES256K.signDetached(payload, jwk);
  const encodedData = base64url(message);

  const signer = SimpleSigner(privateKey);
  const jwsWithPayload = await createJWS(encodedData, signer);

  //dropping the payload section
  const [jwsHeader, , jwsSignature] = jwsWithPayload.split('.');
  const jwsWithoutPayload = [jwsHeader, '', jwsSignature].join('.');
  return jwsWithoutPayload;
}

/**
 * @throws Error
 */
export function verifyEthSignature(message: string, publicKey: PublicKey, jws: string): boolean {
  const [encodedHeader, , encodedSignature] = jws.split('.');
  const encodedPayload = base64url(Buffer.from(message, 'utf-8'));

  const jwsToCheck = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  const retPublicKey = didJwtVerifyJWS(jwsToCheck, publicKey);

  return deepEqual({ ...retPublicKey }, { ...publicKey });
}
