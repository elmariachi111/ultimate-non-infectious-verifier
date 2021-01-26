import { Resolver } from '../Resolver';
import Web3 from 'web3'
//@ts-ignore
import ganache from 'ganache-cli'

describe('Resolver', () => {
  describe('ethrResolver', () => {
    const provider = ganache.provider({
      accounts: [
        {
          secretKey: '0x278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f',
          //  address: '0xf3beac30c498d9e26865f34fcaa57dbb935b0d74',
          //  publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479'
          balance: '0x1000000000000000000'
        },
      ]
    });
    // const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
    const DidReg = Contract(DidRegistryContract)
    const web3 = new Web3()
    web3.setProvider(provider)
    const getAccounts = () =>
      new Promise((resolve, reject) =>
        web3.eth.getAccounts((error, accounts) => (error ? reject(error) : resolve(accounts)))
      )
    DidReg.setProvider(provider)

  it('can create a new keypair', async () => {
    const seed = new Uint8Array(32);
    for (let i = 32; i-- > 0; ) {
      seed[32 - i] = i;
    }
    const keypair = await createEd25519VerificationKey(seed);
    expect(keypair.controller).toBe('did:key:z6MkvCdyqbjuwZcSBqFnB6DAa9YPHNky2PcxxzSTBt9tg7F2');
  });
});
