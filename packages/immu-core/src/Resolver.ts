import BN from 'bn.js';
import base58 from 'bs58';
import { DIDDocument, Resolver as DIDResolver } from 'did-resolver';
import DidRegistryContract from 'ethr-did-registry';
import { bytes32toString, getResolver } from 'ethr-did-resolver';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

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
        return this.resolve(`did:ethr:development:${didOrAddress.toLowerCase()}`);
      }
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  }

  // only used for debugging
  // too specialised for Eth
  // todo: move somewhere else
  async listEvents(address?: EthereumAddress): Promise<any[]> {
    const filter: any = {};
    if (address) {
      filter.identity = address;
    }

    const events = await this.didReg.getPastEvents('DIDAttributeChanged', {
      fromBlock: 0,
      filter
    });
    const now = new BN(Math.floor(new Date().getTime() / 1000));

    return events.map((event) => {
      const name = bytes32toString(event.returnValues.name);
      const match = name.match(/^did\/(pub|auth|svc)\/(\w+)(\/(\w+))?(\/(\w+))?$/);
      const section = match[1];
      const algo = match[2];
      const type = match[4];
      const encoding = match[6];
      const value = event.returnValues.value;
      let key;
      switch (encoding) {
        case null:
        case undefined:
        case 'hex':
          key = value.slice(2);
          break;
        case 'base64':
          key = Buffer.from(value.slice(2), 'hex').toString('base64');
          break;
        case 'base58':
          key = base58.encode(Buffer.from(value.slice(2), 'hex'));
          break;
      }

      return {
        validTo: event.returnValues.validTo,
        expired: now.lte(event.returnValues.validTo),
        section,
        algo,
        type,
        encoding,
        key,
        value,
        name: bytes32toString(event.returnValues.name),
        identity: event.returnValues.identity,
        eventType: event.event
      };
    });
  }
}
