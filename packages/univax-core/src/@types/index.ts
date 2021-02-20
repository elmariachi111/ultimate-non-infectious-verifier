export type BufferLike = Buffer | ArrayBuffer | Uint8Array;

export type DID = string;

export interface JSONProof {
  type: string;
  verificationMethod: DID;
  created: string;
  proofPurpose: string;
  jws: string;
}
