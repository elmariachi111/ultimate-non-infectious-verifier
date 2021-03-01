import fetch from 'cross-fetch';
import { DIDCache, DIDDocument, DIDResolver, Resolver as ResolverClass } from 'did-resolver';
import { getResolver as getEthrDidResolver } from 'ethr-did-resolver';
import { default as getKeyResolver } from 'key-did-resolver';
import { EthProviderConfig } from './@types/Ethereum';

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

    addCustomResolver: function (customRegistry: DIDResolverRegistry | Promise<DIDResolverRegistry>) {
      if (customRegistry instanceof Promise) {
        promises.push(customRegistry);
        customRegistry.then((_registry) => {
          registry = {
            ...registry,
            ..._registry
          };
        });
      } else {
        registry = {
          ...registry,
          ...customRegistry
        };
      }

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

          //need to use Promise manually here, doesn't catch resolver throws :(
          return new Promise((resolve, reject) => {
            localResolver
              .resolve(did)
              .then((resolved) => resolve(resolved))
              .catch((e) => {
                if (fallbackResolver) {
                  (async () => {
                    try {
                      resolve(await fallbackResolver(did));
                    } catch (e) {
                      reject(e);
                    }
                  })();
                } else {
                  reject(e);
                }
              });
          });
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
