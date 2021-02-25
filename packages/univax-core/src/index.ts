export { Issuer } from './Issuer';
export { Verifier, JSONCredential } from './Verifier';
export { Resolver } from './Resolver';
export { EthRegistry } from './EthRegistry';
export * as Ed25519Signing from './Ed25519Signing';
export * as Secp256k1Signing from './Secp256k1Signing';
export * from './Request';
export * from './util/displayCredential';

export { VerifiedCredential, VerifiableCredential, Verifiable, W3CCredential } from 'did-jwt-vc';
export { JWTVerified } from 'did-jwt';
export { Authentication, DIDDocument } from 'did-resolver';
export {
  CredentialPayload,
  JwtCredentialSubject,
  PresentationPayload //VerifiableCredential
} from 'did-jwt-vc/lib/types';

export { DID, BufferLike, JSONProof, PublicKey } from './@types';
export { SidetreeElemEnvironment, CreateSidetreeElemDid } from './SidetreeElem';
export { Element as SidetreeElemMethod } from '@sidetree/element';

export * from './@types/Jolocom';

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
