import {
  VerifiedCredential,
  VerifiedPresentation,
  verifyCredential as jwtVerifyCredential,
  verifyPresentation as jwtVerifyPresentation
} from 'did-jwt-vc';
import { Ed25519Signing } from '.';
import { Secp256k1Signing } from '.';

import { Resolver } from './Resolver';

export interface JSONProof {
  type: string;
  verificationMethod: DID;
  created: string;
  proofPurpose: string;
  jws: string;
}

export interface JSONCredential {
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

    console.log('veriKey', veriKey);

    let result;
    if (veriKey.type == 'Ed25519VerificationKey2018') {
      const key = await Ed25519Signing.recoverEd25519KeyPair(veriKey);
      result = await Ed25519Signing.verifyJws(payload, key, proof.jws);
    } else if (veriKey.type == 'Secp256k1VerificationKey2018') {
      result = Secp256k1Signing.verifyEthSignature(payload, veriKey, proof.jws);
    } else {
      throw new Error("we're only supporting Ed25519VerificationKey2018 and EcdsaSecp256k1Signature2019 atm");
    }

    return result;
  }
}
