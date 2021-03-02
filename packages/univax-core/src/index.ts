export { Issuer } from './Issuer';
export { Verifier, JSONCredential } from './Verifier';
export { default as ResolverBuilder, Resolvable } from './ResolverBuilder';
export { EthRegistry } from './EthRegistry';
export * as Ed25519Signing from './Ed25519Signing';
export * as Secp256k1Signing from './Secp256k1Signing';
export * from './Request';
export * from './util/displayCredential';
export * as Jolocom from './Jolocom';

export { VerifiedCredential, VerifiableCredential, Verifiable, W3CCredential } from 'did-jwt-vc';
export { JWTVerified } from 'did-jwt';
export { Authentication, DIDDocument, PublicKey } from 'did-resolver';
export {
  CredentialPayload,
  JwtCredentialSubject,
  PresentationPayload //VerifiableCredential
} from 'did-jwt-vc/lib/types';

export * from './@types/Jolocom';

export { EthProviderConfig } from './@types/Ethereum';
export { DID, BufferLike, JSONProof } from './@types';
export { FHIRResource, FHIRBundle } from './@types/Fhir';

export { default as VaccinationCredentialVerifier } from './semantic/VaccinationCredentialVerifier';
export {
  Create as CreateFhirHL7Immunization,
  TYPE as SMARTHEALTH_CARD_CRED_TYPE
} from './semantic/FhirHL7VaccinationCredential';

export {
  Create as CreateSchemaOrgImmunization,
  TYPE as SCHEMAORG_CRED_TYPE
} from './semantic/SchemaOrgVaccinationCredential';

export * as Covid19 from './semantic/Covid19';
