import { DIDDocument, Resolver as DIDResolver } from 'did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { default as getKeyResolver } from 'key-did-resolver';
import { DID } from './@types';
import { EthereumAddress, EthProviderConfig } from './@types/Ethereum';

interface DIDResolverRegistry {
  [method: string]: (did: string, parsed: any) => Promise<DIDDocument>;
}
export class Resolver {
  didResolver: DIDResolver;

  private registry: DIDResolverRegistry;

  constructor(providerConfig: EthProviderConfig[]) {
    const ethrDidResolver = getEthrDidResolver({
      networks: providerConfig
    });

    this.registry = {};

    this.didResolver = this.addResolvers({
      ...ethrDidResolver,
      ...getKeyResolver.getResolver()
    });
  }

  public addResolvers(resolvers: DIDResolverRegistry): DIDResolver {
    this.registry = {
      ...this.registry,
      ...resolvers
    };
    this.didResolver = new DIDResolver(this.registry);
    return this.didResolver;
  }

  static ethProviderConfig(infuraId: string): EthProviderConfig[] {
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
