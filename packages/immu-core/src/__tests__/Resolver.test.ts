import { Ed25519Signing, Resolver } from '../';
import web3 from './common/web3Provider';
import newRegistry from './common/newRegistry';

describe('Resolver', () => {
  let resolver: Resolver;
  describe('ethrResolver', () => {
    beforeAll(async () => {
      const registry = await newRegistry(web3);
      resolver = new Resolver([
        {
          name: 'development',
          provider: web3.currentProvider,
          registry: registry.address
        }
      ]);
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
