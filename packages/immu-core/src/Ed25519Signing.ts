import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
import { base58_to_binary, binary_to_base58 } from '@relocke/base58';
import base64url from 'base64url';
import { CryptoLD } from 'crypto-ld';
import { PublicKey } from 'did-resolver';
import { stringToBytes32 } from 'ethr-did-resolver';
//import {EcdsaSecp256k1VerificationKey2019} from 'ecdsa-secp256k1-verification-key-2019';
import { EthereumPrivateKey, Resolver } from './Resolver';

const cryptoLd = new CryptoLD();
cryptoLd.use(Ed25519VerificationKey2018);

export async function createEd25519VerificationKey(
  seed: BufferLike,
  controller: DID
): Promise<Ed25519VerificationKey2018> {
  const edKeyPair = await cryptoLd.generate({
    type: 'Ed25519VerificationKey2018',
    controller,
    seed
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
export async function recoverEd25519KeyPair(
  key: PublicKey,
  privateKeyBase58?: string
): Promise<Ed25519VerificationKey2018> {
  const keyConfig: PublicKey & { privateKeyBase58?: string } = {
    ...key,
    privateKeyBase58
  };

  if (keyConfig.publicKeyBase64) {
    const b64 = Buffer.from(keyConfig.publicKeyBase64, 'base64');
    keyConfig.publicKeyBase58 = binary_to_base58(b64);
  }

  return cryptoLd.from(keyConfig);
}

export async function registerKey(
  resolver: Resolver,
  ethController: EthereumPrivateKey,
  key: Ed25519VerificationKey2018
): Promise<any> {
  const controllingAccount = resolver.web3.eth.accounts.privateKeyToAccount(ethController);

  const duration = 60 * 60 * 24 * 365 * 2;
  const binKey = base58_to_binary(key.publicKeyBase58);
  //console.log(binKey);
  const tx = await resolver.didReg.methods
    .setAttribute(controllingAccount.address, stringToBytes32('did/pub/Ed25519/veriKey/base64'), binKey, duration)
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
export async function sign(message: string, keyPair: Ed25519VerificationKey2018): Promise<string> {
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

export async function verify(data: string, keyPair: Ed25519VerificationKey2018, jws: string): Promise<boolean> {
  const verifier = keyPair.verifier();

  const [encodedHeader, , encodedSignature] = jws.split('.');
  const signature = base64url.toBuffer(encodedSignature);

  const encodedData = base64url(data);
  const payload = Buffer.from(`${encodedHeader}.${encodedData}`, 'utf-8');

  return verifier.verify({ data: payload, signature });
}
