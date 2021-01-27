import { Ed25519Signing } from '../';

describe('Ed255219 Keys', () => {
  it('can create a new keypair', async () => {
    const seed = new Uint8Array(32);
    for (let i = 32; i-- > 0;) {
      seed[32 - i] = i;
    }
    const keypair = await Ed25519Signing.createEd25519VerificationKey(seed);
    expect(keypair.controller).toBe('did:key:z6MkvCdyqbjuwZcSBqFnB6DAa9YPHNky2PcxxzSTBt9tg7F2');
  });

  it('can recover a keypair with private keys', async () => {
    const keypair = await Ed25519Signing.createEd25519VerificationKey();
    const kp = keypair.toKeyPair(true);

    const recovered = await Ed25519Signing.recoverEd25519KeyPair(kp, kp.privateKeyBase58);

    expect(recovered.fingerprint()).toBe(keypair.fingerprint());

    const data = 'Your hovercraft is full of eels';
    const signer = recovered.signer();
    const signature = await signer.sign({ data });

    const verifier = keypair.verifier();
    const verified = await verifier.verify({ data, signature });

    expect(verified).toBe(true);
  });

  it('recovery fails if it is not presented with a compatible key encoding', async () => {
    const keypair = await Ed25519Signing.createEd25519VerificationKey();
    const kp = keypair.toKeyPair(true);

    const pubKey = {
      id: kp.id,
      type: kp.type,
      controller: kp.controller,
      ethereumAddress: '0x0000000000000000000000000000000001'
    };

    const recover = () => {
      Ed25519Signing.recoverEd25519KeyPair(pubKey);
    };

    expect(recover).toThrow();
  });

  it('can recover from a base64 encoded public key', async () => {
    const keypair = await Ed25519Signing.createEd25519VerificationKey();
    const pubKey = {
      id: keypair.id,
      type: keypair.type,
      controller: keypair.controller,
      publicKeyBase64: keypair.publicKeyBuffer.toString('base64')
    };
    const recovered = Ed25519Signing.recoverEd25519KeyPair(pubKey).toKeyPair();

    expect(recovered.publicKeyBase58 == keypair.toKeyPair().publicKeyBase58);
  });

  it('can sign and verify JWS messages', async () => {
    const keypair = await Ed25519Signing.createEd25519VerificationKey();

    const payload = { claim: 'tests are running' };
    const payloadString = JSON.stringify(payload);

    const jws = await Ed25519Signing.signJws(payloadString, keypair);
    const verified = await Ed25519Signing.verifyJws(payloadString, keypair, jws);

    expect(verified).toBe(true);

    const aSlightlyVariedPayloadString = JSON.stringify(payload, null, 4);
    const verified2 = await Ed25519Signing.verifyJws(aSlightlyVariedPayloadString, keypair, jws);

    //todo: a JWS shouldn't depend on JSON formatting or ordering
    //that's "canonicalization" in JSON-LD
    //our impl is not canonicalized at the moment.
    expect(verified2).toBe(false);
  });
});
