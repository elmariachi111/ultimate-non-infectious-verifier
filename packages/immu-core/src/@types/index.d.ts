declare module '@digitalbazaar/ed25519-verification-key-2018';
declare module 'crypto-ld';

type BufferLike = Buffer | ArrayBuffer | Uint8Array;
type DID = string;

interface Ed25519VerificationKey2018 {
  id?: string;
  controller?: string;
  type?: string;
  publicKeyBase58: string;
  privateKeyBase58: string;
  export: (options: { publicKey: boolean; privateKey: boolean }) => Ed25519VerificationKey2018;
  fingerprint: () => string;
  verifier: () => {
    verify: ({ data, signature }: { data: BufferLike; signature: BufferLike }) => Promise<boolean>;
  };
  signer: () => { sign: ({ data }: { data: BufferLike }) => Promise<Buffer> };
  verifyFingerprint: ({ fingerPrint }: { fingerPrint: string }) => { valid: boolean };
}
