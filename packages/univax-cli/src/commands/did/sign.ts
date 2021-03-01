import { Command, flags } from '@oclif/command';
import { Ed25519Signing, Secp256k1Signing } from '@univax/core';
import * as base58 from 'bs58';
import { chooseSigningKey } from '../../helpers/prompts';
import { resolver } from '../../resolver';

export default class Sign extends Command {
  static description = 'creates a new ed25519 signature on message. Asks for private keys';

  static examples = ['$ immu did:sign <did> <message>'];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
  };

  static args = [
    { name: 'did', required: true },
    { name: 'message', required: true }
  ];

  async run() {
    const { flags, args } = this.parse(Sign);
    
    const did = await resolver.resolve(args.did);
    if (!did.authentication) {
      console.error('no authentication methods found in your did')
      return
    }
    const { signingKey, signingPrivateKey } = await chooseSigningKey(did);

    let signer;
    if (signingKey.type == 'Secp256k1VerificationKey2018') {
      const s256keyPair = await (signingKey.ethereumAddress
        ? Secp256k1Signing.recoverKeyPairFromEthereumAccount(signingPrivateKey.slice(2))
        : Secp256k1Signing.recoverKeyPair(signingKey, signingPrivateKey))
      signer = s256keyPair.signer();
    } else if (signingKey.type == 'Ed25519VerificationKey2018') {
      const edKeyPair = await Ed25519Signing.recoverEd25519KeyPair(signingKey, signingPrivateKey);
      signer = await edKeyPair.signer();
    } else {
      throw new Error(`unsupported key type ${signingKey.type}`)
    }

    const signature = await signer.sign({
      data: args.message
    });

    console.log({
      did: did.id,
      message: args.message,
      signature: base58.encode(signature)
    });
    this.exit();
  }
}
