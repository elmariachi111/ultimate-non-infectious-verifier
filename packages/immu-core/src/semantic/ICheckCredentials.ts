import { Verifiable, W3CCredential } from 'did-jwt-vc';
import { Resolver } from '../Resolver';

export default abstract class ICheckCredentials {
  protected resolver;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  protected abstract checkForSchematicCorrectness(claim: Record<string, any>): void;
  protected abstract checkForContentCorrectness(claim: Record<string, any>): void;
  public abstract checkClaimCombination(claims: Record<string, any>[]): void;

  public async checkCredential(credential: Verifiable<W3CCredential>): Promise<Record<string, any>> {
    await this.verifyIssuer(credential);
    const { credentialSubject } = credential;

    this.checkForSchematicCorrectness(credentialSubject);
    this.checkForContentCorrectness(credentialSubject);

    return credentialSubject;
  }

  public async verifyIssuer(credential: W3CCredential): Promise<void> {
    const issuerDid = await this.resolver.resolve(credential.issuer.id);
    if (!(typeof issuerDid.id === 'string')) throw Error("we don't trust the issuer");

    //todo: check on chain if this is a trusted issuer
    //todo: check if the credential has been revoked
  }
}
