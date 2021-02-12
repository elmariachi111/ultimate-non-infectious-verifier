import {
  Verifiable,
  VerifiableCredential,
  VerifiedPresentation,
  verifyCredential as jwtVerifyCredential,
  verifyPresentation as jwtVerifyPresentation,
  W3CCredential
} from 'did-jwt-vc';
import { Ed25519Signing } from '.';
import { Secp256k1Signing } from '.';

import { Resolver } from './Resolver';
import { JWTVerified, verifyJWT as DidVerifyJWT } from 'did-jwt';
import { JSONProof } from './@types';

export interface JSONCredential {
  [x: string]: any;
  proof: JSONProof;
}

export class Verifier {
  private resolver: Resolver;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  async verifyCredential(credential: VerifiableCredential): Promise<Verifiable<W3CCredential>> {
    if (typeof credential === 'string') {
      const verified = await jwtVerifyCredential(credential, this.resolver);
      return verified.verifiableCredential;
    } else {
      const verified = await this.verifyJsonCredential(credential);
      return credential;
    }
  }

  async verifyPresentation(presentationJwt: string): Promise<VerifiedPresentation> {
    return jwtVerifyPresentation(presentationJwt, this.resolver);
  }

  async verifyAnyJwt(jwt: string): Promise<JWTVerified> {
    return DidVerifyJWT(jwt, {
      resolver: this.resolver
    });
  }

  async verifyJsonCredential(jsonCredential: Verifiable<W3CCredential>): Promise<boolean> {
    const { proof, ...credential } = jsonCredential;
    const payload = JSON.stringify(credential, null, 2);

    const did = await this.resolver.resolve(proof.verificationMethod);
    const [veriKey] = did.publicKey.filter((key) => key.id == proof.verificationMethod);

    let result;
    if (veriKey.type == 'Ed25519VerificationKey2018') {
      const key = Ed25519Signing.recoverEd25519KeyPair(veriKey);
      result = await Ed25519Signing.verifyJws(payload, key, proof.jws);
    } else if (veriKey.type == 'Secp256k1VerificationKey2018') {
      result = Secp256k1Signing.verifyEthSignature(payload, veriKey, proof.jws);
    } else {
      throw new Error("we're only supporting Ed25519VerificationKey2018 and EcdsaSecp256k1Signature2019 atm");
    }
    if (!result) throw Error('signature proof is invalid');
    return result;
  }
}
