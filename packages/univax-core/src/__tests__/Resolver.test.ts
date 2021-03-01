import { Ed25519Signing, ResolverBuilder } from '../';
import web3 from './common/web3Provider';
import newRegistry from './common/newRegistry';
import { Resolvable } from 'did-jwt';
import nock from 'nock';
import { DIDDocument, ParsedDID, Resolver } from 'did-resolver';

describe('Resolver', () => {
  let resolver: Resolvable;
  describe('fallbackResolver', () => {
    beforeAll(() => {
      const scope = nock('http://resolver').post('/resolve', { did: 'did:test:x1234' }).reply(200, {
        id: 'did:test:x1234'
      });
    });

    it('can fallback to an async remote resolver', async () => {
      resolver = ResolverBuilder().addRemoteFallbackResolver('http://resolver/resolve').build();
      const someDoc = await resolver.resolve('did:test:x1234');
      expect(someDoc).toEqual({ id: 'did:test:x1234' });
    });
  });

  describe('customResolver', () => {
    it('can register a custom resolver', async () => {
      const customRegistry = {
        test: async (did: string, parsed: ParsedDID, resolver: Resolver): Promise<null | DIDDocument> => {
          return Promise.resolve({
            '@context': 'https://w3id.org/did/v1',
            id: did,
            publicKey: []
          });
        }
      };
      resolver = ResolverBuilder().addCustomResolver(customRegistry).build();
      const resolved = await resolver.resolve('did:test:xCanResolve');
      expect(resolved.id).toEqual('did:test:xCanResolve');
    });

    it('can register a custom resolver asynchronously', async () => {
      const customRegistry = Promise.resolve({
        test: async (did: string, parsed: ParsedDID, resolver: Resolver): Promise<null | DIDDocument> => {
          return Promise.resolve({
            '@context': 'https://w3id.org/did/v1',
            id: did,
            publicKey: []
          });
        }
      });
      resolver = ResolverBuilder().addCustomResolver(customRegistry).build();
      const resolved = await resolver.resolve('did:test:xCanResolve');
      expect(resolved.id).toEqual('did:test:xCanResolve');
    });
  });

  describe('ethrResolver', () => {
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
        .addKeyResolver()
        .build();
    });

    it('runs a local chain', async () => {
      const accounts = await web3.eth.getAccounts();
      expect(accounts.length).toBe(10);

      const bal = await web3.eth.getBalance(accounts[0]);
      expect(bal).toBe('100000000000000000000');
    });

    it('can resolve simple ether dids', async () => {
      const accounts = await web3.eth.getAccounts();
      const did = `did:ethr:development:${accounts[0].toLocaleLowerCase()}`;
      const didDoc = await resolver.resolve(did);
      expect(didDoc.id).toBe(did);
    });

    it('can resolve unregistered key dids', async () => {
      const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();
      const did = `did:key:${edKeyPair.fingerprint()}`;
      const didDoc = await resolver.resolve(did);
      expect(didDoc.id).toBe(did);
    });
  });
});
