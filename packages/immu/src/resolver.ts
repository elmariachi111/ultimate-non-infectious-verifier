import { EthRegistry, Resolver } from "@immu/core";

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



