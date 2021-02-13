import { Create, TYPE as SCHEMAORG_CRED_TYPE } from '../semantic/SchemaOrgCredential';
import { Issuer, Resolver, Verifier } from '..';
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

  it('can create a schema.org credential', async () => {
    const vaccination = Create({
      doseNumber: 1,
      doseQuantity: 50,
      lotNumber: 'ABCDE',
      occurrenceDateTime: new Date('2021-01-01T11:45:33+11:00'),
      vaccineCode: '208'
    });

    const credentialPayload1 = await issuer.issueCredential(didSubject, vaccination, [SCHEMAORG_CRED_TYPE]);
    const signingKey = await resolver.resolve(didIssuer);

    const credential1Proof = await issuer.createJsonProof(
      credentialPayload1,
      signingKey.publicKey[0],
      issuerAccount.privateKey
    );

    const credential1 = {
      ...credentialPayload1,
      proof: credential1Proof
    };

    const result = await verifier.verifyCredential(credential1);
    expect(result).toBeTruthy();
  });
});
