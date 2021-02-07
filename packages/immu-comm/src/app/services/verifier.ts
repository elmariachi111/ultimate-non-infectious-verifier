import { Resolver, Verifier } from '@immu/core';

const resolverConfig = [
  //...Resolver.ethProviderConfig(process.env.INFURA_ID!),
  {
    name: 'development',
    rpcUrl: process.env.ETHEREUM_NODE!,
    registry: process.env.REGISTRY!
  }
];
const resolver = new Resolver(resolverConfig);

const verifier = new Verifier(resolver);

const trustedIssuers = process.env.TRUSTED_ISSUERS?.split(',') || [];

const isIssuerTrusted = (issuerDid: string): boolean => {
  return trustedIssuers.includes(issuerDid);
};

export { resolver, verifier, isIssuerTrusted, trustedIssuers };
