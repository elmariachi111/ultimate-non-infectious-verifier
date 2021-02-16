export { Issuer } from './Issuer';
export { Verifier, JSONCredential } from './Verifier';
export { Resolver } from './Resolver';
export { EthRegistry } from './EthRegistry';
export * as Ed25519Signing from './Ed25519Signing';
export * as Secp256k1Signing from './Secp256k1Signing';
export * from './Request';
export * from './displayCredential';

export { VerifiedCredential, VerifiableCredential, Verifiable, W3CCredential } from 'did-jwt-vc';
export { JWTVerified } from 'did-jwt';
export { default as VaccinationCredentialVerifier } from './semantic/VaccinationCredentialVerifier';
// export {
//   Create as CreateFhirHL7VaccinationCredential,
//   TYPE as SMARTHEALTH_CARD_CRED_TYPE
// } from '../../../bak/FhirHL7VaccinationCredential';

export {
  Create as CreateSchemaOrgVaccinationCredential,
  TYPE as SCHEMAORG_CARD_CRED_TYPE
} from './semantic/SchemaOrgVaccinationCredential';

export { PublicKey, Authentication, DIDDocument } from 'did-resolver';
export { ImmunizationInputParams } from './@types/Fhir';

export {
  CredentialPayload,
  JwtCredentialSubject,
  PresentationPayload //VerifiableCredential
} from 'did-jwt-vc/lib/types';

export { DID, BufferLike, JSONProof } from './@types';
export * from './@types/Jolocom';
