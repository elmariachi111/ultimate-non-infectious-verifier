import { Issuer, Resolver, VaccinationCredentialVerifier, Verifier } from '..';
import { DID } from '../@types';
import { Create as CreateClaim, TYPE as SMARTHEALTH_CARD_CRED_TYPE } from '../semantic/FhirHL7VaccinationCredential';
import newRegistry from './common/newRegistry';
import web3 from './common/web3Provider';

describe('Vaccination Credentials', () => {
  let resolver: Resolver;
  let issuerAccount, subjectAccount, verifierAccount;
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

  let credentials = [];

  it('can verify valid vaccination credentials (happy path)', async () => {
    const immunization1 = CreateClaim({
      doseNumber: 1,
      doseQuantity: 50,
      lotNumber: 'ABCDE',
      occurrenceDateTime: new Date('2021-01-01T11:45:33+11:00'),
      vaccineCode: '208'
    });

    const immunization2 = CreateClaim({
      doseNumber: 2,
      doseQuantity: 80,
      lotNumber: 'EDCBA',
      occurrenceDateTime: new Date('2021-01-30T12:45:33+11:00'),
      vaccineCode: '208'
    });

    const credential1 = await issuer.issueCredential(
      didSubject,
      {
        fhirVersion: '4.0.1',
        fhirResource: immunization1
      },
      [SMARTHEALTH_CARD_CRED_TYPE]
    );
    const credential2 = await issuer.issueCredential(
      didSubject,
      {
        fhirVersion: '4.0.1',
        fhirResource: immunization2
      },
      [SMARTHEALTH_CARD_CRED_TYPE]
    );

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
