import { VerifiableCredential } from 'did-jwt-vc';
import { Resolver } from '../Resolver';
import { FHIRResource } from '../@types/Fhir';
import { ICheckCredentials } from './ICheckCredentials';

export const SMARTHEALTH_CARD_CRED_TYPE = 'https://smarthealth.cards#covid19';

export class FhirVaccinationCredentialVerifier implements ICheckCredentials {
  private resolver;
  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  async checkCredentials(credentials: VerifiableCredential[]): Promise<boolean> {
    const fhirResources = await this.checkIfCredentialsAreValid(credentials);
    return this.checkIfImmunizationIsCorrect(fhirResources);
  }

  private async checkIfCredentialsAreValid(credentials: VerifiableCredential[]): Promise<FHIRResource[]> {
    const fhirResources = await Promise.all(
      credentials.map(
        async (credential: VerifiableCredential): Promise<FHIRResource | null> => {
          if (typeof credential === 'string') {
            throw Error('we dont accept unresolved credential presentations');
          }
          if (!credential.type.includes(SMARTHEALTH_CARD_CRED_TYPE)) {
            throw Error(`atm we're only accepting ${SMARTHEALTH_CARD_CRED_TYPE} credentials`);
          }
          const { fhirResource } = credential.credentialSubject;
          if (!fhirResource) {
            throw Error("credential doesn't contain a FHIR resource");
          }

          const issuerDid = await this.resolver.resolve(credential.issuer.id);
          //todo: check on chain if this is a trusted issuer
          if (!(typeof issuerDid.id === 'string')) throw Error("we don't trust the issuer :( ");

          //todo: check if the credential has been revoked

          //todo: check the resource content | FHIR related
          if (fhirResource.resource.resourceType !== 'Immunization') return null; //skip this one.

          const { coding } = fhirResource.resource.vaccineCode;
          const sidCvxCode = coding.filter((coding: any) => coding.system === 'http://hl7.org/fhir/sid/cvx');
          if (!sidCvxCode) {
            throw Error('we cannot recognize the immunization coding system');
          }

          if (!['207', '208'].includes(sidCvxCode[0].code)) {
            throw Error("we don't recognize the immunization type you received");
          }

          return fhirResource;
        }
      )
    );
    const validResources = fhirResources.filter((fh: FHIRResource | null) => null !== fh);

    if (validResources.length !== 2) {
      throw Error("sorry, we don't support bundled resources yet");
    }

    return validResources as FHIRResource[];
  }

  checkIfImmunizationIsCorrect(fhirResources: FHIRResource[]) {
    const occurrenceTimes = fhirResources.map((fh) => new Date(fh.resource.occurrenceDateTime));
    const msDiff = Math.abs(occurrenceTimes[0].getTime() - occurrenceTimes[1].getTime());
    const dayDiff = msDiff / 1000 / 60 / 60 / 24;
    //if (dayDiff < 28)
    //throw Error(`the immunization dates are too close (${dayDiff} days)`);

    console.log(occurrenceTimes);
    return true;
  }
}
