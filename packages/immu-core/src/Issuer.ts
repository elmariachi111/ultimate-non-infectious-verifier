import { Account } from 'web3-core';

import { Issuer as DidIssuer, createVerifiableCredentialJwt, createVerifiablePresentationJwt } from 'did-jwt-vc';
import { EllipticSigner, SimpleSigner } from 'did-jwt';
import {
  CredentialPayload,
  JwtCredentialSubject,
  PresentationPayload,
  VerifiableCredential
} from 'did-jwt-vc/lib/types';
import { EthereumPrivateKey, Resolver } from './Resolver';
import { DIDDocument, PublicKey } from 'did-resolver';
import { Ed25519Signing, Secp256k1Signing } from '.';

export class Issuer {
  private resolver: Resolver;
  private issuer: Account;

  constructor(resolver: Resolver, privateKey: EthereumPrivateKey) {
    this.resolver = resolver;
    this.issuer = resolver.web3.eth.accounts.privateKeyToAccount(privateKey);
  }

  async issueCredential(
    subjectDid: string,
    claim: JwtCredentialSubject,
    credentialType: string[] = []
  ): Promise<CredentialPayload> {
    const issuerDid = await this.resolver.resolve(this.issuer.address);
    //const nbf = Math.floor( / 1000);
    const vcPayload: CredentialPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subjectDid,
        ...claim
      },
      issuer: issuerDid.id,
      type: ['VerifiableCredential', ...credentialType]
    };
    return vcPayload;
  }

  async resolveIssuerDid(): Promise<DIDDocument> {
    return await this.resolver.resolve(this.issuer.address);
  }

  async createJwt(credential: CredentialPayload) {
    const issuerDid = await this.resolveIssuerDid();
    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(this.issuer.privateKey)
    };

    return createVerifiableCredentialJwt(credential, didIssuer);
  }

  async createPresentation(credentials: VerifiableCredential[]): Promise<PresentationPayload> {
    const issuerDid = await this.resolver.resolve(this.issuer.address);

    const payload: PresentationPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      holder: issuerDid.id,
      verifiableCredential: credentials,
      issuanceDate: new Date().toISOString()
    };
    return payload;
  }

  async createPresentationJwt(presentationPayload: PresentationPayload): Promise<string> {
    const issuerDid = await this.resolver.resolve(this.issuer.address);
    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(this.issuer.privateKey)
    };
    return createVerifiablePresentationJwt(presentationPayload, didIssuer);
  }

  async createJsonProof(
    credential: CredentialPayload,
    signingKey: PublicKey,
    signingPrivateKey: string
  ): Promise<string> {
    //create proof over credential
    let jws, proofType;
    const jsonCredential = JSON.stringify(credential, null, 2);
    if (signingKey.type == 'Ed25519VerificationKey2018') {
      const keyPair = await Ed25519Signing.recoverEd25519KeyPair(signingKey, signingPrivateKey);
      jws = await Ed25519Signing.signJws(jsonCredential, keyPair);
      proofType = 'Ed25519Signature2018';
    } else if (signingKey.type == 'Secp256k1VerificationKey2018') {
      jws = await Secp256k1Signing.signJwsWithPrivateKey(jsonCredential, signingPrivateKey);
      proofType = 'EcdsaSecp256k1Signature2019';
    }

    const proof = {
      type: proofType,
      verificationMethod: signingKey.id,
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      jws
    };

    const verifiedCredential = {
      ...credential,
      proof
    };
    return JSON.stringify(verifiedCredential, null, 2);
  }
  async createProof(credential: CredentialPayload): Promise<string> {
    const ellipticSigner = EllipticSigner(this.issuer.privateKey);
    const signedJose = await ellipticSigner(JSON.stringify(credential));
    return signedJose;
  }
}
