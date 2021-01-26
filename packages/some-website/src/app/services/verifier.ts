import { Resolver, Verifier } from '@immu/core';

console.log('eth', process.env.ETHEREUM_NODE);
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const resolver = new Resolver(process.env.ETHEREUM_NODE!, process.env.REGISTRY!);

const verifier = new Verifier(resolver);

const trustedIssuers = process.env.TRUSTED_ISSUERS?.split(',') || [];

const isIssuerTrusted = (issuerDid: string): boolean => {
  return trustedIssuers.includes(issuerDid);
};

export { resolver, verifier, isIssuerTrusted, trustedIssuers };
