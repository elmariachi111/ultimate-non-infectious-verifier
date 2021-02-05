import { DIDDocument, Resolver as DIDResolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { default as getKeyResolver } from 'key-did-resolver';
import { DID } from './@types';
import { EthereumAddress, EthProviderConfig } from './@types/Ethereum';

export class Resolver {
  didResolver: DIDResolver;

  constructor(providerConfig: EthProviderConfig[]) {
    const ethrDidResolver = getResolver({
      networks: providerConfig
    });

    this.didResolver = new DIDResolver({
      ...ethrDidResolver,
      ...getKeyResolver.getResolver()
    });
  }

  static ethProviderConfig(infuraId: string) {
    return [
      { name: 'mainnet', rpcUrl: `https://mainnet.infura.io/v3/${infuraId}` },
      { name: 'rinkeby', rpcUrl: `https://rinkeby.infura.io/v3/${infuraId}` },
      { name: 'goerli', rpcUrl: `https://goerli.infura.io/v3/${infuraId}` }
    ];
  }

  public async resolve(didOrAddress: EthereumAddress | DID): Promise<DIDDocument> {
    try {
      if (didOrAddress.startsWith('0x')) {
        return this.resolve(`did:ethr:${didOrAddress.toLowerCase()}`);
      } else {
        return this.didResolver.resolve(didOrAddress);
      }
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  }
}
