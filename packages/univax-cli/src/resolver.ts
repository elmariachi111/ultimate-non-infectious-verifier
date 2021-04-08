import { EthRegistry, ResolverBuilder, EthProviderConfig, Jolocom, DIDDocument, Resolvable } from "@univax/core";
import { GetResolver as GetSidetreeElementResolver} from "@univax/sidetree";
import sidetree from './methods/sidetree';
import jolocom from './methods/jolocom';

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
  const sideTreeRegistry = async() => {
    const _sidetree = await sidetree;
    if (!_sidetree) 
      throw Error("sidetree not constructed");
    return GetSidetreeElementResolver(_sidetree);
  }

  builder.addCustomResolver(sideTreeRegistry());
}

if (REMOTE_FALLBACK_RESOLVER) {
  builder.addRemoteFallbackResolver(REMOTE_FALLBACK_RESOLVER)
}


const jolocomResolver = async() => {
  const sdk = await jolocom;
  const resolve = async (did: string): Promise<DIDDocument> => {
    const identity = await sdk.resolve(did);
    return identity.didDocument.toJSON() as unknown as DIDDocument
  }
  return {"jun": resolve, "jolo": resolve};
}

builder.addCustomResolver(jolocomResolver())

export const registry = new EthRegistry(ethNetworks);
export const resolver: Resolvable = builder.build();
