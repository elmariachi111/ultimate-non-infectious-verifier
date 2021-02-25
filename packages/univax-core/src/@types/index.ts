import { PublicKey as DIDPublicKey } from 'did-resolver';

export type BufferLike = Buffer | ArrayBuffer | Uint8Array;

export type DID = string;

export interface JSONProof {
  type: string;
  verificationMethod: DID;
  created: string;
  proofPurpose: string;
  jws: string;
}

export interface JsonWebKey {
  alg?: string;
  crv?: string;
  d?: string;
  dp?: string;
  dq?: string;
  e?: string;
  ext?: boolean;
  k?: string;
  key_ops?: string[];
  kid?: string;
  kty?: string;
  n?: string;
  p?: string;
  q?: string;
  qi?: string;
  use?: string;
  x?: string;
  y?: string;
}

export type PublicKey = DIDPublicKey & {
  publicKeyJwk?: JsonWebKey;
};
