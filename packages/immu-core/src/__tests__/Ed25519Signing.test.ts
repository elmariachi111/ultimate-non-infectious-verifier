import { createEd25519VerificationKey } from '../Ed25519Signing';

describe('Ed255219 Keys', () => {
  it('can create a new keypair', async () => {
    const seed = new Uint8Array(32);
    for (let i = 32; i-- > 0; ) {
      seed[32 - i] = i;
    }
    const keypair = await createEd25519VerificationKey(seed);
    expect(keypair.controller).toBe('did:key:z6MkvCdyqbjuwZcSBqFnB6DAa9YPHNky2PcxxzSTBt9tg7F2');
  });
});
