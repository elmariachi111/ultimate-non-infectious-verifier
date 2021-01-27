//import { Resolver } from '../Resolver';
import Web3 from 'web3';
//@ts-ignore
import ganache from 'ganache-cli';
import contract from '@truffle/contract';
import DidRegistryContract from 'ethr-did-registry';
import { Ed25519Signing, Resolver } from '../';

describe('Resolver', () => {
  const provider = ganache.provider({
    mnemonic: 'myth like bonus scare over problem client lizard pioneer submit female collect',
    total_accounts: 10,
    default_balance_ether: 100
  });
  const web3 = new Web3(provider);
  const DidReg = contract(DidRegistryContract);
  DidReg.setProvider(provider);

  let resolver: Resolver;
  describe('ethrResolver', () => {
    beforeAll(async () => {
      const accounts = await web3.eth.getAccounts();
      const registry = await DidReg.new({
        from: accounts[9],
        gasPrice: 100000000000,
        gas: 4712388 // 1779962
      });

      resolver = new Resolver([
        {
          name: 'development',
          provider,
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
