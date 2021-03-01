import { EthRegistry, ResolverBuilder, EthProviderConfig } from "@univax/core";
import sidetree from './sidetree';

const { NODE_ENV, ETHEREUM_NODE, REMOTE_FALLBACK_RESOLVER, SIDETREE, REGISTRY, IPFS_API, MONGO_CONNECTION, INFURA_ID} = process.env;

let ethNetworks: EthProviderConfig[] = [];

if (INFURA_ID) {
  ethNetworks = [
    ...ethNetworks,
    ...ResolverBuilder.ethProviderConfig(INFURA_ID!)
  ]
} 

if (NODE_ENV == 'development') { 
  ethNetworks = [
  ...ethNetworks,
  {
    name: "development",
    rpcUrl: ETHEREUM_NODE,
    registry: REGISTRY!
  }
]
}

const builder = ResolverBuilder().addKeyResolver().addEthResolver(ethNetworks);

if (SIDETREE && ETHEREUM_NODE && IPFS_API && MONGO_CONNECTION) {
  builder.addSideTreeResolver(sidetree);
}

if (REMOTE_FALLBACK_RESOLVER) {
  builder.addRemoteFallbackResolver(REMOTE_FALLBACK_RESOLVER)
}

export const registry = new EthRegistry(ethNetworks);
export const resolver = builder.build();
