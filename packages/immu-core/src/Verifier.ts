import {
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential as jwtVerifyCredential,
  verifyPresentation as jwtVerifyPresentation
} from 'did-jwt-vc';
import { Ed25519Signing } from '.';
import { Resolver } from './Resolver';

interface JSONProof {
  type: string;
  verificationMethod: DID;
  created: string;
  proofPurpose: string;
  jws: string;
}

interface JSONCredential {
  [x: string]: any;
  proof: JSONProof;
}

export class Verifier {
  private resolver: Resolver;
  public verifierDID: DID;

  constructor(resolver: Resolver, verifierDID?: string) {
    this.resolver = resolver;
    this.verifierDID = verifierDID || '';
  }

  async verifyCredential(claimJwt: string): Promise<VerifiedCredential> {
    return jwtVerifyCredential(claimJwt, this.resolver.didResolver);
  }

  async verifyPresentation(presentationJwt: string): Promise<VerifiedPresentation> {
    return jwtVerifyPresentation(presentationJwt, this.resolver.didResolver);
  }

  async verifyJsonCredential(jsonCredential: JSONCredential): Promise<boolean> {
    const { proof, ...credential } = jsonCredential;
    const payload = JSON.stringify(credential, null, 2);

    const did = await this.resolver.resolve(proof.verificationMethod);
    const [veriKey] = did.publicKey.filter((key) => key.id == proof.verificationMethod);
    if (veriKey.type != 'Ed25519VerificationKey2018')
      throw new Error("sorry, we're only supporting Ed25519 signatures atm");

    const key = await Ed25519Signing.recoverEd25519KeyPair(veriKey);
    const result = await Ed25519Signing.verify(payload, key, proof.jws);
    return result;
  }
}
