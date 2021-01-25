import { Resolver, Verifier } from '@immu/core';

console.log('eth', process.env.ETHEREUM_NODE);
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const resolver = new Resolver(process.env.ETHEREUM_NODE!, process.env.REGISTRY!);

const verifier = new Verifier(resolver);

export { resolver, verifier };
