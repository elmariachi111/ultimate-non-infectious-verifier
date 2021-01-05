#!/usr/bin/env node
import { verifyCredential } from 'did-jwt-vc';
import { Resolver } from 'did-resolver';
import { config } from 'dotenv-flow';
import { getResolver } from 'ethr-did-resolver';

config();

const providerConfig = {
  networks: [
    {
      name: 'development',
      rpcUrl: process.env.ETHEREUM_NODE,
      registry: process.env.REGISTRY
    }
  ]
};
const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);

async function verifyClaim(claimJwt: string) {
  const verifiedJwt = await verifyCredential(claimJwt, didResolver);
  console.log(verifiedJwt);
}

verifyClaim(process.argv[2]);
