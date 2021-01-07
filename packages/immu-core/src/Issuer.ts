import { Account } from 'web3-core';

import { Issuer as DidIssuer, createVerifiableCredentialJwt } from 'did-jwt-vc';
import { SimpleSigner } from 'did-jwt';
import { CredentialPayload, JwtCredentialSubject } from 'did-jwt-vc/lib/types';
import { EthereumPrivateKey, EthereumAddress, Resolver } from './Resolver';

export class Issuer {
  private resolver: Resolver;
  private issuer: Account;

  constructor(resolver: Resolver, privateKey: EthereumPrivateKey) {
    this.resolver = resolver;
    this.issuer = resolver.web3.eth.accounts.privateKeyToAccount(privateKey);
  }

  async issueCredential(
    subject: EthereumAddress,
    claim: JwtCredentialSubject,
    credentialType: string[] = []
  ): Promise<CredentialPayload> {
    const issuerDid = await this.resolver.getDid(this.issuer.address);
    const subjectDid = await this.resolver.getDid(subject);

    //const nbf = Math.floor( / 1000);
    const vcPayload: CredentialPayload = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      issuanceDate: new Date(),
      credentialSubject: {
        id: subjectDid.id,
        ...claim
      },
      issuer: issuerDid.id,
      type: ['VerifiableCredential', ...credentialType]
    };
    return vcPayload;
  }

  async createJwt(credential: CredentialPayload) {
    const issuerDid = await this.resolver.getDid(this.issuer.address);
    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(this.issuer.privateKey)
    };

    return createVerifiableCredentialJwt(credential, didIssuer);
  }

  async createProof(credentital: CredentialPayload) {
    throw 'not impl';
  }
}
