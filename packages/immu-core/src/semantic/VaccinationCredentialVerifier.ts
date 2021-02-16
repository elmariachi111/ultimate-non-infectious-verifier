import { VerifiableCredential } from 'did-jwt-vc';
import { Resolver } from '../Resolver';
import { Verifier } from '../Verifier';
import ICheckCredentials, { VerifierFlags } from './ICheckCredentials';
import { FhirHL7VaccinationCredential, TYPE as SMARTHEALTH_CARD_CRED_TYPE } from './FhirHL7VaccinationCredential';
import { SchemaOrgVaccinationCredential, TYPE as SCHEMAORG_CRED_TYPE } from './SchemaOrgCredential';

/**
 * verifies credentials using pluggable validation strategies
 */
export default class VaccinationCredentialVerifier {
  private strategies: Record<string, ICheckCredentials> = {};

  private resolver: Resolver;
  private verifier: Verifier;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
    this.verifier = new Verifier(resolver);
  }
  //isKnownIssuer = (did: string) => {};
  initialize() {
    this.strategies = {
      [SMARTHEALTH_CARD_CRED_TYPE]: new FhirHL7VaccinationCredential(this.resolver),
      [SCHEMAORG_CRED_TYPE]: new SchemaOrgVaccinationCredential(this.resolver)
    };
  }

  get supportedStrategies(): string[] {
    return Object.keys(this.strategies);
  }

  async verify(presentedCredentials: VerifiableCredential[], flags?: VerifierFlags) {
    const appliedStrategies: Set<ICheckCredentials> = new Set();
    const verifiedClaims: Record<string, any>[] = [];

    for await (const credential of presentedCredentials) {
      const verifiedCredential = await this.verifier.verifyCredential(credential);
      try {
        const strategyType = this.supportedStrategies.find((t) => verifiedCredential.type.includes(t));
        if (!strategyType) {
          throw Error('dont have a verification strategy for this credential type');
        }

        const iCheckCredentials = this.strategies[strategyType];
        appliedStrategies.add(iCheckCredentials);

        const verifiedClaim = await iCheckCredentials.checkCredential(verifiedCredential, flags);
        verifiedClaims.push(verifiedClaim);
      } catch (e) {
        console.error(e);
      }
    }

    for (const strategy of appliedStrategies) {
      strategy.checkClaimCombination(verifiedClaims);
    }

    return true;
  }
}
