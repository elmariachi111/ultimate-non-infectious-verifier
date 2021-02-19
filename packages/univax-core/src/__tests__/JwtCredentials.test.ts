import { Resolver, Issuer, Verifier } from '..';
import web3 from './common/web3Provider';
import newRegistry from './common/newRegistry';
import { DID } from '../@types';

describe('JwtCredentials', () => {
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

  it('can create a payload', async () => {
    const payload = await issuer.issueCredential(didSubject, { worksAt: { company: 'Acme company' } }, [
      'EmployedCredential'
    ]);

    expect(payload.issuer.id).toBe(didIssuer);
    expect(payload.credentialSubject.id).toBe(didSubject);
    expect(payload.type).toContain('EmployedCredential');
  });

  it('can issue and verify a Jwt', async () => {
    const payload = await issuer.issueCredential(didSubject, { worksAt: { company: 'Acme company' } }, [
      'EmployedCredential'
    ]);

    const jwt = await issuer.createJwt(payload, issuerAccount.privateKey);
    expect(typeof jwt).toBe('string');

    const verified = await verifier.verifyCredential(jwt);

    expect(verified.issuer.id).toBe(didIssuer);
    expect(verified.credentialSubject.id).toBe(didSubject);
    expect(verified.credentialSubject.worksAt).toStrictEqual({ company: 'Acme company' });
  });
});
