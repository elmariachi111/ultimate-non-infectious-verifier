import { EthRegistry, Resolver, SidetreeElemEnvironment } from "@univax/core";

const config =
    [
        ...Resolver.ethProviderConfig(process.env.INFURA_ID!),
        {
            name: "development",
            rpcUrl: process.env.ETHEREUM_NODE!,
            registry: process.env.REGISTRY!
        }
    ];

export const registry = new EthRegistry(config);
export const resolver = new Resolver(config);

/**
 * adds sidetree/elem resolver
 * 
 * @param resolver 
 */
export async function extendResolver(resolver: Resolver): Promise<Resolver> {

    await resolver.initializeSidetreeResolver({
      eth: {
        node: process.env.ETHEREUM_NODE!,
        sideTreeContractAddress: process.env.SIDETREE!,
      },
      ipfsNode: process.env.IPFS_API!,
      mongoConnection: process.env.MONGO_CONNECTION!,
      dbName: 'element-test'
    })

    return resolver;
}
