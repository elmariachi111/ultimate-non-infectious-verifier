import { Account } from 'web3-core';
import {
  Issuer,
  Resolver,
  VaccinationCredentialVerifier,
  Verifier,
  VerifiableCredential,
  CreateFhirHL7VaccinationCredential,
  SMARTHEALTH_CARD_CRED_TYPE
} from '..';
import { DID } from '../@types';
import newRegistry from './common/newRegistry';
import web3 from './common/web3Provider';

describe('Vaccination Credentials', () => {
  let resolver: Resolver;
  let issuerAccount: Account;
  let subjectAccount: Account;
  let verifierAccount: Account;
  let didIssuer: DID;
  let didSubject: DID;
  let didVerifier: DID;
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
    verifierAccount = web3.eth.accounts.create();

    didIssuer = `did:ethr:development:${issuerAccount.address}`;
    didSubject = `did:ethr:development:${subjectAccount.address}`;
    didVerifier = `did:ethr:development:${verifierAccount.address}`;
    issuer = new Issuer(resolver, didIssuer);
    verifier = new Verifier(resolver);
  });

  let credentials: VerifiableCredential[] = [];

  it('can verify valid vaccination credentials (happy path)', async () => {
    const immunization1 = CreateFhirHL7VaccinationCredential({
      doseSequence: 1,
      doseQuantity: 50,
      lotNumber: 'ABCDE',
      occurrenceDateTime: new Date('2021-01-01T11:45:33+11:00'),
      drug: {
        code: {
          codingSystem: 'http://hl7.org/fhir/sid/cvx',
          codeValue: '208'
        }
      }
    });

    const immunization2 = CreateFhirHL7VaccinationCredential({
      doseSequence: 2,
      doseQuantity: 80,
      lotNumber: 'EDCBA',
      occurrenceDateTime: new Date('2021-01-30T12:45:33+11:00'),
      drug: {
        code: {
          codingSystem: 'http://hl7.org/fhir/sid/cvx',
          codeValue: '208'
        }
      }
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
