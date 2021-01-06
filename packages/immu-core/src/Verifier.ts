import { VerifiedCredential, verifyCredential } from 'did-jwt-vc';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

export class Verifier {
  private didResolver: Resolver;

  constructor(ethereumRpcUrl: string, registry: string) {
    const providerConfig = {
      networks: [
        {
          name: 'development',
          rpcUrl: ethereumRpcUrl,
          registry: registry
        }
      ]
    };
    const ethrDidResolver = getResolver(providerConfig);
    this.didResolver = new Resolver(ethrDidResolver);
  }

  async verifyClaim(claimJwt: string): Promise<VerifiedCredential> {
    const verifiedJwt = await verifyCredential(claimJwt, this.didResolver);
    return verifiedJwt;
  }
}
