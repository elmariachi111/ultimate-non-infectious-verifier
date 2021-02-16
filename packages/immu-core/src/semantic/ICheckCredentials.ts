import { Verifiable, W3CCredential } from 'did-jwt-vc';
import { ImmunizationInputParams } from '../@types/Fhir';
import { Resolver } from '../Resolver';
import { Verifier } from '../Verifier';

//https://www2a.cdc.gov/vaccines/IIS/IISStandards/vaccines.asp?rpt=cvx
const knownCovid19CvxCodes = ['CVX-207', 'CVX-208', 'CVX-210', 'CVX-212'];
const knownFhirSidCvxCodes = ['207', '208', '210', '212'];

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

  protected abstract normalize(claim: Record<string, any>): ImmunizationInputParams | undefined;

  public async checkCredential(
    credential: Verifiable<W3CCredential>,
    flags?: VerifierFlags
  ): Promise<ImmunizationInputParams | null> {
    if (!flags?.skipIssuerCheck) {
      await this.verifyIssuer(credential);
    }

    const { credentialSubject } = credential;
    //todo: check if the credential has been revoked

    const normalized = this.normalize(credentialSubject);

    if (normalized) {
      this.checkForContentCorrectness(normalized);
      return normalized;
    }
    return null;
  }

  protected checkForContentCorrectness(immunization: ImmunizationInputParams): void {
    let immunizationRecognized = false;
    let codeValue = '';

    switch (immunization.drug.code.codingSystem) {
      case 'http://hl7.org/fhir/sid/cvx':
        codeValue = immunization.drug.code.codeValue;
        immunizationRecognized = knownFhirSidCvxCodes.includes(codeValue);
        break;
      case 'CDC-MVX.CVX':
        codeValue = immunization.drug.code.codeValue.split('.')[1];
        immunizationRecognized = knownCovid19CvxCodes.includes(codeValue);
        break;
    }

    if (!immunizationRecognized) {
      throw Error(
        `we don't recognize the vaccination code you received (${immunization.drug.code.codeValue}/${codeValue})`
      );
    }
  }

  public static checkClaimCombination(normalizedClaims: ImmunizationInputParams[]): void {
    if (normalizedClaims.length !== 2) {
      throw Error('you must present exactly 2 resources');
    }

    const treatmentDates = normalizedClaims.map((claim) => new Date(claim.occurrenceDateTime).getTime());
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
