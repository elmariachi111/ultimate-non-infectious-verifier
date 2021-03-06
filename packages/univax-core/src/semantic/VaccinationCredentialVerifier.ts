import { Verifiable, VerifiableCredential, VerifiedCredential, W3CCredential } from 'did-jwt-vc';

import { Resolvable, Verifier } from '..';

import ICheckCredentials, { VerifierFlags } from './ICheckCredentials';
import { FhirHL7VaccinationCredential, TYPE as SMARTHEALTH_CARD_CRED_TYPE } from './FhirHL7VaccinationCredential';
import { SchemaOrgVaccinationCredential, TYPE as SCHEMAORG_CRED_TYPE } from './SchemaOrgVaccinationCredential';
import { CovidImmunization } from './Covid19';

/**
 * verifies credentials using pluggable validation strategies
 */
export default class VaccinationCredentialVerifier {
  private strategies: Record<string, ICheckCredentials> = {};

  private resolver: Resolvable;
  private verifier: Verifier;

  constructor(resolver: Resolvable) {
    this.resolver = resolver;
    this.verifier = new Verifier(resolver);
  }

  initialize() {
    this.strategies = {
      [SMARTHEALTH_CARD_CRED_TYPE]: new FhirHL7VaccinationCredential(this.resolver),
      [SCHEMAORG_CRED_TYPE]: new SchemaOrgVaccinationCredential(this.resolver)
    };
  }

  get supportedStrategies(): string[] {
    return Object.keys(this.strategies);
  }

  public getStrategy(types: string[]) {
    const strategyType = this.supportedStrategies.find((t) => types.includes(t));
    if (!strategyType) {
      throw Error('dont have a verification strategy for this credential type');
    }
    return this.strategies[strategyType];
  }

  async verify(
    presentedCredentials: VerifiableCredential[],
    flags?: VerifierFlags
  ): Promise<Verifiable<W3CCredential>[]> {
    const immunizations: CovidImmunization[] = [];
    const verifiedCredentials: Verifiable<W3CCredential>[] = [];

    for await (const credential of presentedCredentials) {
      const verifiedCredential = await this.verifier.verifyCredential(credential);
      verifiedCredentials.push(verifiedCredential);

      try {
        const iCheckCredentials = this.getStrategy(verifiedCredential.type);

        const immunization = await iCheckCredentials.checkCredential(verifiedCredential, flags);
        if (immunization) {
          immunizations.push(immunization);
        }
      } catch (e) {
        console.error(e);
      }
    }

    ICheckCredentials.checkVaccinationCombination(immunizations);

    return verifiedCredentials;
  }
}
