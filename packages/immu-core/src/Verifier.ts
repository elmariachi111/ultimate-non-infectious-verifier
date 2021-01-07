import { VerifiedCredential, verifyCredential } from 'did-jwt-vc';
import { Resolver } from './Resolver';

export class Verifier {
  private resolver: Resolver;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  async verifyCredential(claimJwt: string): Promise<VerifiedCredential> {
    return verifyCredential(claimJwt, this.resolver.didResolver);
  }
}
