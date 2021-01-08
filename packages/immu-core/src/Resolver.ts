import Web3 from 'web3';

import { Resolver as DIDResolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { AbiItem } from 'web3-utils';
import DidRegistryContract from 'ethr-did-registry';
import { DIDDocument } from 'did-resolver';

export type EthereumAddress = string;
export type EthereumPrivateKey = string;

export class Resolver {
  didResolver: DIDResolver;
  web3: Web3;

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
  }

  async checkOwner(ethAddress: EthereumAddress) {
    const didReg = new this.web3.eth.Contract(DidRegistryContract.abi as AbiItem[], process.env.REGISTRY);
    const owner = await didReg.methods.identityOwner(ethAddress).call();
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
