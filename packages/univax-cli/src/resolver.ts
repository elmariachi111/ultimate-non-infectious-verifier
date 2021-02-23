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

/** private singleton */
let sidetreeElemMethodInstance: SidetreeElemMethod;

export async function getSidetreeElemMethod(): Promise<SidetreeElemMethod> {
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

export const registry = new EthRegistry(config);
export const resolver = new Resolver(config);

    

