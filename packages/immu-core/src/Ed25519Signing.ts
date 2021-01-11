import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
//import {EcdsaSecp256k1VerificationKey2019} from 'ecdsa-secp256k1-verification-key-2019';
import { EthereumAddress, EthereumPrivateKey, Resolver } from './Resolver';
import { stringToBytes32 } from 'ethr-did-resolver';
import { CryptoLD } from 'crypto-ld';
import * as ed25519 from '@transmute/did-key-ed25519';
import { base58_to_binary } from '@relocke/base58';
import { Account } from 'web3-core';

export async function createEd25519VerificationKey(
  seed: BufferLike,
  controller: DID
): Promise<Ed25519VerificationKey2018> {
  const cryptoLd = new CryptoLD();
  cryptoLd.use(Ed25519VerificationKey2018);
  const edKeyPair = await cryptoLd.generate({
    type: 'Ed25519VerificationKey2018',
    controller,
    seed
  });

  return edKeyPair;
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

export async function sign(message: string, privateKeyHex: string) {}

/**
 * generate Ed25519 keys using @transmute libraries ()
 * unused
 */
async function transmuteGenerateEd25519VerificationKey(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await ed25519.Ed25519KeyPair.generate({
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
