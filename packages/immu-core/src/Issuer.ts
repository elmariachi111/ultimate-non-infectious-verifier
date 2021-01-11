import { Account } from 'web3-core';

import {
  Issuer as DidIssuer,
  createVerifiableCredentialJwt,
  JwtPresentationPayload,
  createVerifiablePresentationJwt
} from 'did-jwt-vc';
import { EllipticSigner, SimpleSigner } from 'did-jwt';
import { CredentialPayload, JwtCredentialSubject, VerifiableCredential } from 'did-jwt-vc/lib/types';
import { EthereumPrivateKey, Resolver } from './Resolver';

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
      issuanceDate: new Date(),
      credentialSubject: {
        id: subjectDid,
        ...claim
      },
      issuer: issuerDid.id,
      type: ['VerifiableCredential', ...credentialType]
    };
    return vcPayload;
  }
  async createJwt(credential: CredentialPayload) {
    const issuerDid = await this.resolver.resolve(this.issuer.address);
    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(this.issuer.privateKey)
    };

    return createVerifiableCredentialJwt(credential, didIssuer);
  }

  async createPresentation(credentials: VerifiableCredential[]) {
    const vpPayload: JwtPresentationPayload = {
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: credentials
      }
    };
    return vpPayload;
  }

  async createPresentationJwt(vpPayload: JwtPresentationPayload): Promise<string> {
    const issuerDid = await this.resolver.resolve(this.issuer.address);
    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(this.issuer.privateKey)
    };
    return createVerifiablePresentationJwt(vpPayload, didIssuer);
  }

  async createProof(credential: CredentialPayload): Promise<string> {
    const ellipticSigner = EllipticSigner(this.issuer.privateKey);
    const signedJose = await ellipticSigner(JSON.stringify(credential));
    return signedJose;
  }
}
