import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
//import {EcdsaSecp256k1VerificationKey2019} from 'ecdsa-secp256k1-verification-key-2019';
import { EthereumAddress, EthereumPrivateKey, Resolver } from './Resolver';
import { PublicKey } from 'did-resolver';
import { stringToBytes32 } from 'ethr-did-resolver';
import { CryptoLD } from 'crypto-ld';
import { base58_to_binary, binary_to_base58 } from '@relocke/base58';
import { Account } from 'web3-core';

import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
//@ts-ignore
import { default as jsonLdUtil } from 'jsonld-signatures/lib/util';

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
  privateKeyBase58: string
): Promise<Ed25519VerificationKey2018> {
  const keyConfig: PublicKey & { privateKeyBase58: string } = {
    ...key,
    privateKeyBase58
  };

  if (keyConfig.publicKeyBase64) {
    const b64 = Buffer.from(keyConfig.publicKeyBase64, 'base64');
    keyConfig.publicKeyBase58 = binary_to_base58(b64);
  }

  console.log(keyConfig);

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
 * https://github.com/digitalbazaar/jsonld-signatures/blob/master/lib/suites/JwsLinkedDataSignature.js
 */
export async function sign(message: string, keyPair: Ed25519KeyPair): Promise<string> {
  const signer = keyPair.signer();
  const verifyData = Buffer.from(message, 'utf-8');
  //return signer.sign({ data });

  const header = {
    alg: 'EdDSA',
    b64: false,
    crit: ['b64']
  };

  const encodedHeader = jsonLdUtil.encodeBase64Url(JSON.stringify(header));
  const data = jsonLdUtil.createJws({ encodedHeader, verifyData });
  const signature = await signer.sign({ data });

  // create detached content signature
  const encodedSignature = jsonLdUtil.encodeBase64Url(signature);
  const jws = encodedHeader + '..' + encodedSignature;
  return jws;
}

/**
 * generate Ed25519 keys using @transmute libraries ()
 * unused
 */
async function transmuteGenerateEd25519VerificationKey(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await Ed25519KeyPair.generate({
    secureRandom: () => {
      return Uint8Array.from(Web3.utils.hexToBytes(Web3.utils.randomHex(32)));
    }
  });

  const ret: any = {
    publicKey: Web3.utils.bytesToHex(Array.from<number>(keyPair.publicKeyBuffer))
  };

  if (keyPair.privateKeyBuffer) {
    ret.privateKey = Web3.utils.bytesToHex(Array.from(keyPair.privateKeyBuffer));
  }
  return ret;
}
