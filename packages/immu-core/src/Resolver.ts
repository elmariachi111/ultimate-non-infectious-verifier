import Web3 from 'web3';

import { Resolver as DIDResolver } from 'did-resolver';
import { getResolver, stringToBytes32 } from 'ethr-did-resolver';
import { AbiItem } from 'web3-utils';
import DidRegistryContract from 'ethr-did-registry';
import { DIDDocument } from 'did-resolver';
import { Contract } from 'web3-eth-contract';
import { Account } from 'web3-core';

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
