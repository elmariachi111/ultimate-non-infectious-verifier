import { Create, TYPE as SCHEMAORG_CRED_TYPE } from '../semantic/SchemaOrgCredential';
import { Issuer, Resolver, VaccinationCredentialVerifier, Verifier } from '..';
import { DID } from '../@types';

import newRegistry from './common/newRegistry';
import web3 from './common/web3Provider';

describe('Vaccination Credentials', () => {
  let resolver: Resolver;
  let issuerAccount, subjectAccount;
  let didIssuer: DID;
  let didSubject: DID;
  let issuer: Issuer;
  let verifier: Verifier;

  beforeAll(async () => {
    const registry = await newRegistry(web3);
    resolver = new Resolver([
      {
        name: 'development',
        provider: web3.currentProvider,
        registry: registry.address
      }
    ]);

    issuerAccount = web3.eth.accounts.create();
    subjectAccount = web3.eth.accounts.create();

    didIssuer = `did:ethr:development:${issuerAccount.address}`;
    didSubject = `did:ethr:development:${subjectAccount.address}`;

    issuer = new Issuer(resolver, didIssuer);
    verifier = new Verifier(resolver);
  });

  let credentials = [];

  it('can create a schema.org credential', async () => {
    const vaccination1 = Create({
      doseNumber: 1,
      doseQuantity: 50,
      lotNumber: 'ABCDE',
      occurrenceDateTime: new Date('2021-01-01T11:45:33+11:00'),
      vaccineCode: '210'
    });

    const vaccination2 = Create({
      doseNumber: 2,
      doseQuantity: 50,
      lotNumber: 'EDCBA',
      occurrenceDateTime: new Date('2021-01-30T11:45:33+11:00'),
      vaccineCode: '210'
    });

    const credentialPayload1 = await issuer.issueCredential(didSubject, vaccination1, [SCHEMAORG_CRED_TYPE]);
    const credentialPayload2 = await issuer.issueCredential(didSubject, vaccination2, [SCHEMAORG_CRED_TYPE]);

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
