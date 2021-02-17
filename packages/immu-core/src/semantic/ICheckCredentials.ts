import { Verifiable, W3CCredential } from 'did-jwt-vc';
import { Resolver } from '../Resolver';
import { Verifier } from '../Verifier';
import { CovidImmunization } from './Covid19';

export interface VerifierFlags {
  skipIssuerCheck?: boolean;
}

export default abstract class ICheckCredentials {
  protected resolver: Resolver;
  protected verifier: Verifier;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
    this.verifier = new Verifier(resolver);
  }

  protected abstract normalize(claim: Record<string, any>): CovidImmunization | undefined;
  protected checkForContentCorrectness(immunization: CovidImmunization): void {
    return;
  }

  public async checkCredential(
    credential: Verifiable<W3CCredential>,
    flags?: VerifierFlags
  ): Promise<CovidImmunization | undefined> {
    if (!flags?.skipIssuerCheck) {
      await this.verifyIssuer(credential);
      //todo: check if the credential has been revoked
    }

    const normalized = this.normalize(credential.credentialSubject);

    if (normalized) {
      this.checkForContentCorrectness(normalized);
    }
    return normalized;
  }

  public static checkVaccinationCombination(immunizations: CovidImmunization[]): void {
    if (immunizations.length !== 2) {
      throw Error('you must present exactly 2 resources');
    }

    const treatmentDates = immunizations.map((vacc) => vacc.occurrenceDateTime.getTime());
    const msDiff = Math.abs(treatmentDates[0] - treatmentDates[1]);
    const dayDiff = msDiff / 1000 / 60 / 60 / 24;

    if (dayDiff < 21) {
      console.error(`the immunization dates are too close (${dayDiff})`);
      //throw Error(`the immunization dates are too close (${dayDiff})`);
    }
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
