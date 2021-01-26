import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import BN from 'bn.js';
import base58 from 'bs58';
import DidRegistryContract from 'ethr-did-registry';
import { bytes32toString, REGISTRY as defaultRegistryAddress, stringToBytes32 } from 'ethr-did-resolver';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { EthereumAddress, EthereumPrivateKey, EthProviderConfig } from './@types/Ethereum';

export class EthRegistry {
  didRegistries: {
    [network: string]: {
      web3: Web3;
      contract: Contract;
    };
  } = {};

  constructor(providerConfig: EthProviderConfig[]) {
    providerConfig.map((cfg: EthProviderConfig) => {
      const web3 = new Web3(cfg.provider || cfg.rpcUrl!);
      this.didRegistries[cfg.name] = {
        web3,
        contract: new web3.eth.Contract(DidRegistryContract.abi as AbiItem[], cfg.registry || defaultRegistryAddress)
      };
    });
  }

  async checkOwner(ethAddress: EthereumAddress, network: string) {
    const owner = await this.didRegistries[network].contract.methods.identityOwner(ethAddress).call();
    console.log(owner);
  }

  /**
   * //todo (low prio): add support for additional Sec256k keys
   * //todo this will only work with a provider that controls address
   *
   * registers a new key on an ethr did registry
   *
   * @param newPublicKey
   * @param ethPrivateKey
   * @param network string development | mainnet | rinkeby | goerli
   */
  async addKey(newPublicKey: Ed25519KeyPair, address: EthereumAddress, network = 'development'): Promise<any> {
    const { contract } = this.didRegistries[network];

    const duration = 60 * 60 * 24 * 365 * 2;

    const tx = contract.methods
      .setAttribute(
        address.toLowerCase(),
        stringToBytes32('did/pub/Ed25519/veriKey/base58'),
        newPublicKey.publicKeyBuffer,
        duration
      )
      .send({
        from: address
      });
    return tx;
  }

  // only used for debugging, does the same thing as ethr-did-resolver under the hood
  async listEvents(network: string, address?: EthereumAddress): Promise<any[]> {
    const filter: any = {};
    if (address) {
      filter.identity = address;
    }

    const events = await this.didRegistries[network].contract.getPastEvents('DIDAttributeChanged', {
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
