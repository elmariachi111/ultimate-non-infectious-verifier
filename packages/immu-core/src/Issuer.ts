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
import { DIDDocument } from 'did-resolver';

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

  async createProof(credential: CredentialPayload): Promise<string> {
    const ellipticSigner = EllipticSigner(this.issuer.privateKey);
    const signedJose = await ellipticSigner(JSON.stringify(credential));
    return signedJose;
  }
}
