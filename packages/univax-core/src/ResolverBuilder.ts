import { DIDCache, DIDDocument, DIDResolver, Resolver as ResolverClass } from 'did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { default as getKeyResolver } from 'key-did-resolver';
import { EthProviderConfig } from './@types/Ethereum';
import { GetResolver as GetSidetreeElementResolver, SidetreeElemMethod, SidetreeElemEnvironment } from './SidetreeElem';
import { Element } from '@sidetree/element';
import fetch from 'cross-fetch';

export interface DIDResolverRegistry {
  [index: string]: DIDResolver;
}

export interface Resolvable {
  resolve: (did: string) => Promise<DIDDocument>;
}

export type Resolver = (did: string) => Promise<DIDDocument>;

export default function ResolverBuilder() {
  let registry: DIDResolverRegistry = {};
  let cache: boolean | DIDCache = false;

  let fallbackResolver: Resolver;
  let initialized = false;

  const promises: Promise<any>[] = [];

  return {
    addEthResolver: function (ethNetworks: EthProviderConfig[] = [], infuraId?: string) {
      let networks = ethNetworks;

      if (infuraId) {
        networks = ResolverBuilder.ethProviderConfig(infuraId);
      }

      registry = {
        ...registry,
        ...getEthrDidResolver({ networks })
      };
      return this;
    },

    addKeyResolver: function () {
      registry = {
        ...registry,
        ...getKeyResolver.getResolver()
      };
      return this;
    },

    addSideTreeResolver: async function (sidetreeElem: Element | Promise<Element>) {
      if (sidetreeElem instanceof Promise) {
        promises.push(sidetreeElem);
      }
      registry = {
        ...registry,
        ...GetSidetreeElementResolver(await sidetreeElem)
      };
      return this;
    },

    addCustomResolver: function (method: string, resolve: DIDResolver) {
      registry[method] = resolve;
      return this;
    },

    addRemoteFallbackResolver: function (url: string) {
      fallbackResolver = async function (did: string): Promise<DIDDocument> {
        const result = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            did
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const jResult = await result.json();
        if (jResult['id'] === did) {
          return jResult;
        } else {
          throw new Error(`unresolveable ${did}`);
        }
      };
      return this;
    },

    enableCache: function () {
      cache = true;
    },

    build: function (): Resolvable {
      let localResolver: ResolverClass;
      return {
        resolve: async (did: string): Promise<DIDDocument> => {
          if (!initialized) {
            await Promise.all(promises);
            localResolver = new ResolverClass(registry, cache);
            initialized = true;
          }

          try {
            return localResolver.resolve(did);
          } catch (e) {
            if (fallbackResolver) {
              return fallbackResolver(did);
            }

            console.error(e.message);
            throw e;
          }
        }
      };
    }
  };
}

ResolverBuilder.ethProviderConfig = (infuraId: string): EthProviderConfig[] => {
  return [
    { name: 'mainnet', rpcUrl: `https://mainnet.infura.io/v3/${infuraId}` },
    { name: 'ropsten', rpcUrl: `https://ropsten.infura.io/v3/${infuraId}` },
    { name: 'rinkeby', rpcUrl: `https://rinkeby.infura.io/v3/${infuraId}` },
    { name: 'goerli', rpcUrl: `https://goerli.infura.io/v3/${infuraId}` }
  ];
};