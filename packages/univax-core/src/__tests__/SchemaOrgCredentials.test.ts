import {
  Issuer,
  ResolverBuilder,
  Resolvable,
  VaccinationCredentialVerifier,
  Verifier,
  VerifiableCredential,
  CreateSchemaOrgImmunization,
  SCHEMAORG_CRED_TYPE
} from '..';
import { DID } from '../@types';

import newRegistry from './common/newRegistry';
import web3 from './common/web3Provider';
import { Account } from 'web3-core';

describe('Schema.org Vaccination Credentials', () => {
  let resolver: Resolvable;
  let issuerAccount: Account;
  let subjectAccount: Account;
  let didIssuer: DID;
  let didSubject: DID;
  let issuer: Issuer;
  let verifier: Verifier;

  beforeAll(async () => {
    const registry = await newRegistry(web3);
    resolver = ResolverBuilder()
      .addEthResolver([
        {
          name: 'development',
          provider: web3.currentProvider,
          registry: registry.address
        }
      ])
      .build();

    issuerAccount = web3.eth.accounts.create();
    subjectAccount = web3.eth.accounts.create();

    didIssuer = `did:ethr:development:${issuerAccount.address}`;
    didSubject = `did:ethr:development:${subjectAccount.address}`;

    issuer = new Issuer(resolver, didIssuer);
    verifier = new Verifier(resolver);
  });

  let credentials: VerifiableCredential[] = [];
  let immunization1: any;

  it('can create a schema.org immunization claim', async () => {
    immunization1 = CreateSchemaOrgImmunization({
      doseSequence: 1,
      doseQuantity: 50,
      lotNumber: 'ABCDE',
      occurrenceDateTime: new Date('2021-01-01T11:45:33+11:00'),
      cvxCode: '208'
    });
  });

  it('can create a verifiable set of schema.org credential', async () => {
    const immunization2 = CreateSchemaOrgImmunization({
      doseSequence: 2,
      doseQuantity: 50,
      lotNumber: 'EDCBA',
      occurrenceDateTime: new Date('2021-01-30T11:45:33+11:00'),
      cvxCode: '208'
    });

    const credentialPayload1 = await issuer.issueCredential(didSubject, immunization1, [SCHEMAORG_CRED_TYPE]);
    const credentialPayload2 = await issuer.issueCredential(didSubject, immunization2, [SCHEMAORG_CRED_TYPE]);

    const signingKey = await resolver.resolve(didIssuer);

    const credential1Proof = await issuer.createJsonProof(
      credentialPayload1,
      signingKey.publicKey[0],
      issuerAccount.privateKey
    );

    const credential2Proof = await issuer.createJsonProof(
      credentialPayload2,
      signingKey.publicKey[0],
      issuerAccount.privateKey
    );

    const credential1 = {
      ...credentialPayload1,
      proof: credential1Proof
    };

    const credential2 = {
      ...credentialPayload2,
      proof: credential2Proof
    };

    const result = await verifier.verifyCredential(credential1);
    expect(result).toBeTruthy();

    credentials = [credential1, credential2];
  });

  it('can verify a set of schema.org credentials', async () => {
    const vaccVerifier = new VaccinationCredentialVerifier(resolver);
    vaccVerifier.initialize();

    const verificationResult = await vaccVerifier.verify(credentials, { skipIssuerCheck: true });
    expect(verificationResult).toBeTruthy();
  });
});
