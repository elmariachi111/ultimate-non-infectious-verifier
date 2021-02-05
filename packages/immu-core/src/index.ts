export { Issuer } from './Issuer';
export { Verifier, JSONCredential, JSONProof } from './Verifier';
export { Resolver } from './Resolver';
export { EthRegistry } from './EthRegistry';

export { VerifiedCredential } from 'did-jwt-vc';
export { JWTVerified } from 'did-jwt';

export { PublicKey, Authentication, DIDDocument } from 'did-resolver';
export * as Ed25519Signing from './Ed25519Signing';
export * as Secp256k1Signing from './Secp256k1Signing';
export * from './displayCredential';
export * from './Request';

export {
  CredentialPayload,
  JwtCredentialSubject,
  PresentationPayload,
  VerifiableCredential
} from 'did-jwt-vc/lib/types';
