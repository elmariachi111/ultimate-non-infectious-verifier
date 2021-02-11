import { VerifiableCredential } from 'did-jwt-vc';
import { Resolver } from '../Resolver';
import { FhirVaccinationCredentialVerifier, SMARTHEALTH_CARD_CRED_TYPE } from './FhirVaccinationCredential';
import { ICheckCredentials } from './ICheckCredentials';

/**
 * verifies credentials depending on their type
 */
export class VaccinationCredentialVerifier {
  private strategies: Record<string, ICheckCredentials> = {};

  initialize(resolver: Resolver) {
    this.strategies[SMARTHEALTH_CARD_CRED_TYPE] = new FhirVaccinationCredentialVerifier(resolver);
  }

  get supportedStrategies(): string[] {
    return Object.keys(this.strategies);
  }

  async verify(presentedCredentials: VerifiableCredential[]) {
    for await (const strategy of Object.values(this.strategies)) {
      try {
        const result = await strategy.checkCredentials(presentedCredentials);
        if (result) {
          return result;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  isKnownIssuer = (did: string) => {};
}

export function makeCredentialVerifier(resolver: Resolver) {
  const ret = new VaccinationCredentialVerifier();
  ret.initialize(resolver);
  return ret;
}
