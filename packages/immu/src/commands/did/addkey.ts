import { Ed25519Signing, EthRegistry } from '@immu/core';
import { Command, flags } from '@oclif/command';
import { requestAndResolvePrivateKey } from '../../helpers/prompts';
import { resolver, registry } from '../../resolver';

export default class AddKey extends Command {
  static description = 'creates a new Ed25519 keypair for signing and registers it on registry'

  static examples = [
    `$ immu did:addkey <did> `,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    network: flags.string({ char: 'n', description: 'eth network', default: 'development' })
  }

  async run() {
    const { args, flags } = this.parse(AddKey);
    const privateKey = await requestAndResolvePrivateKey();

    const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();
    registry.addKey(privateKey, edKeyPair, flags.network);

    console.log("key details", await edKeyPair.toKeyPair(true));
    //todo: this is now stuck on a "development" network)
    console.log("new did doc", await resolver.resolve(`did:ethr:development:${tx.from}`));
  }
}