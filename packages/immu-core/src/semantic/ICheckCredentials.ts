import { Verifiable, W3CCredential } from 'did-jwt-vc';
import { Resolver } from '../Resolver';
import { Verifier } from '../Verifier';

export default abstract class ICheckCredentials {
  protected resolver: Resolver;
  protected verifier: Verifier;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
    this.verifier = new Verifier(resolver);
  }

  protected abstract checkForSchematicCorrectness(claim: Record<string, any>): void;
  protected abstract checkForContentCorrectness(claim: Record<string, any>): void;
  public abstract checkClaimCombination(claims: Record<string, any>[]): void;

  public async checkCredential(
    credential: Verifiable<W3CCredential>,
    flags?: VerifierFlags
  ): Promise<Record<string, any>> {
    if (!flags?.skipIssuerCheck) {
      await this.verifyIssuer(credential);
    }

    const { credentialSubject } = credential;
    //todo: check if the credential has been revoked

    this.checkForSchematicCorrectness(credentialSubject);
    this.checkForContentCorrectness(credentialSubject);

    return credentialSubject;
  }

  private async lookupPractitionerCredential(
    serviceEndpoint: string,
    issuerDid: string,
    credentialType: string
  ): Promise<any> {
    const url = `${serviceEndpoint}/${issuerDid}?vctype=${credentialType}`;
    console.log(url);
    const credentialQuery = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const credentials = await credentialQuery.json();
    return credentials;
  }

  public async verifyIssuer(credential: W3CCredential): Promise<void> {
    const issuerDid = await this.resolver.resolve(credential.issuer.id);
    if (!(typeof issuerDid.id === 'string')) throw Error("we don't trust the issuer");

    if (issuerDid.service) {
      const serviceEntry = issuerDid.service.find((svc: any) => svc.type === 'CredentialService');
      if (serviceEntry) {
        const credentialType = 'ProofOfProvider';
        const providerCredential = await this.lookupPractitionerCredential(
          serviceEntry.serviceEndpoint,
          issuerDid.id,
          credentialType
        );
        console.log('got proof of provider', providerCredential);
        const firstCredential = providerCredential[0];
        await this.verifier.verifyCredential(firstCredential);
        //todo: check on chain if this is a trusted issuer
      }
    }
  }
}

export interface VerifierFlags {
  skipIssuerCheck?: boolean;
}
