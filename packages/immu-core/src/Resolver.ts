import Web3 from 'web3';

import { Resolver as DIDResolver } from 'did-resolver';
import { getResolver, stringToBytes32 } from 'ethr-did-resolver';
import { AbiItem } from 'web3-utils';
import DidRegistryContract from 'ethr-did-registry';
import { DIDDocument } from 'did-resolver';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';
import * as ed25519 from '@transmute/did-key-ed25519';

export type EthereumAddress = string;
export type EthereumPrivateKey = string;

export class Resolver {
  didResolver: DIDResolver;
  web3: Web3;
  didReg: Contract;

  constructor(ethereumRpcUrl: string, registry: string) {
    const providerConfig = {
      networks: [
        {
          name: 'development',
          rpcUrl: ethereumRpcUrl,
          registry
        }
      ]
    };
    this.web3 = new Web3(ethereumRpcUrl);
    const ethrDidResolver = getResolver(providerConfig);
    this.didResolver = new DIDResolver(ethrDidResolver);

    this.didReg = new this.web3.eth.Contract(DidRegistryContract.abi as AbiItem[], process.env.REGISTRY);
  }

  async checkOwner(ethAddress: EthereumAddress) {
    const owner = await this.didReg.methods.identityOwner(ethAddress).call();
    console.log(owner);
  }

  async addEd25519VerificationKey(privateKey: EthereumPrivateKey): Promise<any> {
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    const duration = 60 * 60 * 24 * 365 * 2;

    const keyPair = await ed25519.Ed25519KeyPair.generate({
      secureRandom: () => {
        return Uint8Array.from(this.web3.utils.hexToBytes(this.web3.utils.randomHex(32)));
      }
    });

    const ret: any = {
      publicKey: this.web3.utils.bytesToHex(Array.from<number>(keyPair.publicKeyBuffer))
    };
    if (keyPair.privateKeyBuffer) {
      ret.privateKey = this.web3.utils.bytesToHex(Array.from(keyPair.privateKeyBuffer));
    }
    const tx = await this.didReg.methods
      .setAttribute(account.address, stringToBytes32('did/pub/Ed25519/veriKey/base64'), ret.publicKey, duration)
      .send({
        from: account.address
      });
    console.debug(tx);
    return ret;
  }

  async getDid(ethAddress: EthereumAddress): Promise<DIDDocument> {
    try {
      return this.resolve(`did:ethr:development:${ethAddress}`);
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  }

  async resolve(did: string): Promise<DIDDocument> {
    return this.didResolver.resolve(did);
  }
}
