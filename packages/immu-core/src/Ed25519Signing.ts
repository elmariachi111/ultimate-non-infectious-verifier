//import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import base64url from 'base64url';
import bs58 from 'bs58';
//import { CryptoLD } from 'crypto-ld';
import crypto from 'crypto';
import { PublicKey } from 'did-resolver';
import { stringToBytes32 } from 'ethr-did-resolver';
import { EthereumPrivateKey, Resolver } from './Resolver';

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
export async function recoverEd25519KeyPair(key: PublicKey, privateKeyBase58?: string): Promise<Ed25519KeyPair> {
  const keyConfig = {
    ...key,
    publicKeyBase58: key.publicKeyBase58 || bs58.encode(Buffer.from(key.publicKeyBase64!, 'base64')),
    privateKeyBase58
  };

  if (!keyConfig.publicKeyBase58) {
    throw new Error('needs a public key');
  }

  return Ed25519KeyPair.from(keyConfig);
}

export async function registerKey(
  resolver: Resolver,
  ethController: EthereumPrivateKey,
  key: Ed25519KeyPair
): Promise<any> {
  const controllingAccount = resolver.web3.eth.accounts.privateKeyToAccount(ethController);

  const duration = 60 * 60 * 24 * 365 * 2;
  const tx = await resolver.didReg.methods
    .setAttribute(
      controllingAccount.address.toLowerCase(),
      stringToBytes32('did/pub/Ed25519/veriKey/base58'),
      key.publicKeyBuffer,
      duration
    )
    .send({
      from: controllingAccount.address
    });
  return tx;
}

/**
 * tried
 * https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/JwsLinkedDataSignature.js
 *
 * but gave up and went with the plain idea:
 * http://www.davedoesdev.com/json-web-signatures-on-node-js/
 */
export async function sign(message: string, keyPair: Ed25519KeyPair): Promise<string> {
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

export async function verify(data: string, keyPair: Ed25519KeyPair, jws: string): Promise<boolean> {
  const verifier = keyPair.verifier();

  const [encodedHeader, , encodedSignature] = jws.split('.');
  const signature = base64url.toBuffer(encodedSignature);

  const encodedData = base64url(data);
  const payload = Buffer.from(`${encodedHeader}.${encodedData}`, 'utf-8');

  return verifier.verify({ data: payload, signature });
}
