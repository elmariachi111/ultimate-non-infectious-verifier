import {
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential as jwtVerifyCredential,
  verifyPresentation as jwtVerifyPresentation
} from 'did-jwt-vc';
import { Resolver } from './Resolver';

export class Verifier {
  private resolver: Resolver;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  async verifyCredential(claimJwt: string): Promise<VerifiedCredential> {
    return jwtVerifyCredential(claimJwt, this.resolver.didResolver);
  }

  async verifyPresentation(presentationJwt: string): Promise<VerifiedPresentation> {
    return jwtVerifyPresentation(presentationJwt, this.resolver.didResolver);
  }
}
