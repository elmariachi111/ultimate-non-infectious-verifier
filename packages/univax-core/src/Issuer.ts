import { createJWT as DidCreateJWT, SimpleSigner } from 'did-jwt';
import { createVerifiableCredentialJwt, createVerifiablePresentationJwt, Issuer as DidIssuer } from 'did-jwt-vc';
import {
  CredentialPayload,
  JwtCredentialSubject,
  PresentationPayload,
  Proof,
  VerifiableCredential,
  W3CCredential
} from 'did-jwt-vc/lib/types';
import { DIDDocument, PublicKey } from 'did-resolver';
import { Ed25519Signing, Secp256k1Signing, Resolvable } from '.';
import { DID } from './@types';

export class Issuer {
  private resolver: Resolvable;
  private did: DID;

  /**
   * @param resolver Resolver
   * @param did string
   */
  constructor(resolver: Resolvable, did: DID) {
    this.resolver = resolver;
    this.did = did;
  }

  async resolveIssuerDid(): Promise<DIDDocument> {
    return await this.resolver.resolve(this.did);
  }

  async issueCredential(
    subjectDid: DID,
    claim: JwtCredentialSubject,
    credentialType: string[] = []
  ): Promise<W3CCredential> {
    const issuerDid = await this.resolver.resolve(this.did);
    //const nbf = Math.floor( / 1000);
    const vcPayload: W3CCredential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDid,
        ...claim
      },
      issuer: {
        id: issuerDid.id
      },
      type: ['VerifiableCredential', ...credentialType]
    };
    return vcPayload;
  }

  async createPresentation(credentials: VerifiableCredential[]): Promise<PresentationPayload> {
    const payload: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: this.did,
      verifiableCredential: credentials,
      issuanceDate: new Date().toISOString()
    };
    return payload;
  }

  async createJwt(credential: CredentialPayload, privateKey: string) {
    const issuerDid = await this.resolver.resolve(this.did);
    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(privateKey)
    };

    return createVerifiableCredentialJwt(credential, didIssuer);
  }

  async createPresentationJwt(presentationPayload: PresentationPayload, privateKey: string): Promise<string> {
    const didIssuer: DidIssuer = {
      did: this.did,
      signer: SimpleSigner(privateKey)
    };
    return createVerifiablePresentationJwt(presentationPayload, didIssuer);
  }

  async createAnyJwt(payload: any, privateKey: string): Promise<string> {
    const signer = SimpleSigner(privateKey);
    const jwt = await DidCreateJWT(payload, {
      issuer: this.did,
      signer,
      alg: 'ES256K'
    });
    return jwt;
  }

  async createJsonProof(
    credential: CredentialPayload | Record<string, any>,
    signingKey: PublicKey,
    privateKey: string
  ): Promise<Proof> {
    //create proof over credential
    let jws, proofType;
    const jsonCredential = JSON.stringify(credential, null, 2);
    if (signingKey.type == 'Ed25519VerificationKey2018') {
      const keyPair = Ed25519Signing.recoverEd25519KeyPair(signingKey, privateKey);
      jws = await Ed25519Signing.signJws(jsonCredential, keyPair);
      proofType = 'Ed25519Signature2018';
    } else if (signingKey.type == 'Secp256k1VerificationKey2018') {
      jws = await Secp256k1Signing.signJwsWithPrivateKey(jsonCredential, privateKey);
      proofType = 'EcdsaSecp256k1Signature2019';
    }

    const proof = {
      type: proofType,
      verificationMethod: signingKey.id,
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      jws
    };

    return proof;
  }

  /**
   * @deprecated | unused
   * @param credential
   */
  // async createProof(credential: CredentialPayload): Promise<string> {
  //   const ellipticSigner = EllipticSigner(this.privateKey);
  //   const signedJose = await ellipticSigner(JSON.stringify(credential));
  //   return signedJose;
  // }
}
