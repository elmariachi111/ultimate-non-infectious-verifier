import { Ed25519Signing, EthRegistry } from '@univax/core';
import { Command, flags } from '@oclif/command';
import { resolver, registry } from '../../resolver';

export default class AddKey extends Command {
  static description = 'creates a new Ed25519 keypair for signing and registers it on eth registry';

  static examples = ['$ immu did:addkey <did> '];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    network: flags.string({ char: 'n', description: 'eth network', default: 'development' })
  };

  static args = [{name: 'did', required: true}];

  async run() {
    const { args, flags } = this.parse(AddKey);

    const did = await resolver.resolve(args.did)
    if (!did.publicKey[0].ethereumAddress) {
      throw new Error("we're only support Ethr dids at the moment");
    }

    const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();
    const tx = await registry.addKey(edKeyPair, did.publicKey[0].ethereumAddress, flags.network);

    console.log('key details', await edKeyPair.toKeyPair(true));
    console.log('new did doc', await resolver.resolve(args.did));
  }
}
