import { Account } from 'web3-core';
import {
  Issuer,
  Resolvable,
  ResolverBuilder,
  VaccinationCredentialVerifier,
  VerifiableCredential,
  CreateFhirHL7Immunization,
  SMARTHEALTH_CARD_CRED_TYPE
} from '..';
import { DID } from '../@types';
import newRegistry from './common/newRegistry';
import web3 from './common/web3Provider';

describe('Fhir HL7 / M$ Smart Health Card Vaccination Credentials', () => {
  let resolver: Resolvable;
  let issuerAccount: Account;
  let subjectAccount: Account;
  let didIssuer: DID;
  let didSubject: DID;
  let issuer: Issuer;

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
  });

  let credentials: VerifiableCredential[] = [];

  it('can verify valid vaccination credentials (happy path)', async () => {
    const immunization1 = CreateFhirHL7Immunization({
      doseSequence: 1,
      doseQuantity: 50,
      lotNumber: 'ABCDE',
      occurrenceDateTime: new Date('2021-01-01T11:45:33+11:00'),
      cvxCode: '208'
    });

    const immunization2 = CreateFhirHL7Immunization({
      doseSequence: 2,
      doseQuantity: 80,
      lotNumber: 'EDCBA',
      occurrenceDateTime: new Date('2021-01-30T12:45:33+11:00'),
      cvxCode: '208'
    });

    const credential1 = await issuer.issueCredential(didSubject, immunization1, [SMARTHEALTH_CARD_CRED_TYPE]);
    const credential2 = await issuer.issueCredential(didSubject, immunization2, [SMARTHEALTH_CARD_CRED_TYPE]);

    const credential1Jwt = await issuer.createJwt(credential1, issuerAccount.privateKey);
    const credential2Jwt = await issuer.createJwt(credential2, issuerAccount.privateKey);
    expect(typeof credential1Jwt).toBe('string');

    credentials = [credential1Jwt, credential2Jwt];
  });

  it('can verify a set of immunization credentials', async () => {
    const vaccVerifier = new VaccinationCredentialVerifier(resolver);
    vaccVerifier.initialize();

    const verificationResult = await vaccVerifier.verify(credentials);
    expect(verificationResult).toBeTruthy();
  });
});
