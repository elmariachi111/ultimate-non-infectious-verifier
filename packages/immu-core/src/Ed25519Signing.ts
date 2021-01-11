import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';
//import {EcdsaSecp256k1VerificationKey2019} from 'ecdsa-secp256k1-verification-key-2019';
import { EthereumAddress } from './Resolver';
import { stringToBytes32 } from 'ethr-did-resolver';
import { CryptoLD } from 'crypto-ld';
import * as ed25519 from '@transmute/did-key-ed25519';

export async function createEd25519VerificationKey(
  seed: BufferLike,
  controller: DID
  /*didRegistry: Contract, forAddress: EthereumAddress*/
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

/**
 * generate Ed25519 keys using @transmute libraries ()
 * unused
 */
async function transmuteAddEd25519VerificationKey(didRegistry: Contract, forAddress: EthereumAddress): Promise<any> {
  const duration = 60 * 60 * 24 * 365 * 2;

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
  const tx = await didRegistry.methods
    .setAttribute(forAddress, stringToBytes32('did/pub/Ed25519/veriKey/base64'), ret.publicKey, duration)
    .send({
      from: forAddress
    });
  console.debug(tx);
  return ret;
}

export async function sign(message: string, privateKeyHex: string) {}
