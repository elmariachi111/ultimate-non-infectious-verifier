import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { Account } from 'web3-core';
import { Ed25519Signing, Issuer, Resolver, Verifier } from '..';
import { DID } from '../@types';
import { EthereumAddress } from '../@types/Ethereum';
import { EthRegistry } from '../EthRegistry';
import newRegistry from './common/newRegistry';
import web3 from './common/web3Provider';

describe('EthRegistry', () => {
  let resolver: Resolver;
  let someAccount: EthereumAddress;
  let didSome: DID;
  let someKeyPair: Ed25519KeyPair;
  let anotherAccount: Account;
  let didAnother: DID;
  let issuer: Issuer;
  let verifier: Verifier;
  let ethRegistry: EthRegistry;

  beforeAll(async () => {
    const contractRegistry = await newRegistry(web3);
    const regConfig = [
      {
        name: 'development',
        provider: web3.currentProvider,
        registry: contractRegistry.address
      }
    ];

    resolver = new Resolver(regConfig);
    ethRegistry = new EthRegistry(regConfig);

    someAccount = (await web3.eth.getAccounts())[1];
    someKeyPair = await Ed25519Signing.createEd25519VerificationKey();
    didSome = `did:ethr:development:${someAccount.toLocaleLowerCase()}`;

    anotherAccount = web3.eth.accounts.create();
    didAnother = `did:ethr:development:${anotherAccount.address.toLocaleLowerCase()}`;

    issuer = new Issuer(resolver, didSome);
    verifier = new Verifier(resolver);
  });

  it('can check the owner of a did', async () => {
    const checked = await ethRegistry.checkOwner(someAccount, 'development');
    expect(checked).toBe(someAccount);
  });

  it('can add register a new key for a did', async () => {
    const tx = await ethRegistry.addKey(someKeyPair, someAccount, 'development');
    const resolved = await resolver.resolve(didSome);
    expect(resolved.publicKey).toHaveLength(2);

    const kp = someKeyPair.toKeyPair();
    const newKey = resolved.publicKey.find((pk) => pk.type == 'Ed25519VerificationKey2018');
    expect(newKey.publicKeyBase58).toBe(kp.publicKeyBase58);
  });

  it('can register service urls to the did', async () => {
    const tx = await ethRegistry.addService(
      'CredentialRepository',
      'http://localhost:8080/vc/and-a-long-tail/afterwards#withCuriousChars',
      someAccount,
      'development'
    );
    const resolved = await resolver.resolve(didSome);
    expect(resolved.service).toHaveLength(1);
    const service = resolved.service.find((svc) => svc.type == 'CredentialRepository');

    expect(service.serviceEndpoint).toBe('http://localhost:8080/vc/and-a-long-tail/afterwards#withCuriousChars');
  });

  it('can sign things with the new key that others will verify', async () => {
    const resolved = await resolver.resolve(didSome);
    const signingKey = resolved.publicKey.find((pk) => pk.type == 'Ed25519VerificationKey2018');
    expect(resolved.publicKey).toHaveLength(2);
    const kp = someKeyPair.toKeyPair(true);

    const claim = await issuer.issueCredential(
      didAnother,
      {
        isAGoodFriend: true
      },
      ['FriendCredential']
    );

    const proof = await issuer.createJsonProof(claim, signingKey, kp.privateKeyBase58);
    const signedCredential = {
      ...claim,
      proof
    };

    const result = await verifier.verifyJsonCredential(signedCredential);
    expect(result).toBeTruthy();

    try {
      const tamperedCredential = {
        ...claim,
        hello: 'world',
        proof
      };
      const result = await verifier.verifyJsonCredential(tamperedCredential);
      expect(1).toBe(2); // <-- this will never be hit.
    } catch (e) {
      expect(e.message).toBe('signature proof is invalid');
    }
  });
});
