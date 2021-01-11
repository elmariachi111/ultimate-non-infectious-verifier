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

//todo: make network aware (mainnet, rinkeby...)
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

  async resolve(didOrAddress: EthereumAddress | DID): Promise<DIDDocument> {
    try {
      if (didOrAddress.startsWith('did:')) {
        return this.didResolver.resolve(didOrAddress);
      } else {
        return this.resolve(`did:ethr:development:${didOrAddress}`);
      }
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  }
}
