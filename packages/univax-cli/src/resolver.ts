import { EthRegistry, Resolver, SidetreeElem, SidetreeElemMethod, GetSidetreeElementResolver } from "@univax/core";

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

    /** private singleton */
    let sidetreeElemMethodInstance: SidetreeElemMethod;

    async function getSidetreeElemMethod(): Promise<SidetreeElemMethod> {
        if (!sidetreeElemMethodInstance) {
            sidetreeElemMethodInstance = await SidetreeElem({
                eth: {
                    node: process.env.ETHEREUM_NODE!,
                    sideTreeContractAddress: process.env.SIDETREE!,
                },
                ipfsNode: process.env.IPFS_API!,
                mongoConnection: process.env.MONGO_CONNECTION!,
                dbName: 'element-test'
            });    
        }
    
        return sidetreeElemMethodInstance;
    }

    const sidetreeElemMethod = await getSidetreeElemMethod();
    resolver.addResolvers(GetSidetreeElementResolver(sidetreeElemMethod));
    return resolver;
}

