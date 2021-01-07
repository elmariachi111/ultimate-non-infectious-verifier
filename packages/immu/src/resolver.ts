import { Resolver } from "@immu/core";

const resolver = new Resolver(
    process.env.ETHEREUM_NODE!,
    process.env.REGISTRY!
);

export default resolver;