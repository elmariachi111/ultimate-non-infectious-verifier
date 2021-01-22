import { Ed25519Signing } from '@immu/core';
import { Command, flags } from '@oclif/command';
import requestAndResolvePrivateKey from '../../helpers/resolvePrivateKey';
import resolver from '../../resolver';

export default class AddKey extends Command {
  static description = 'creates a new Ed25519 keypair for signing and registers it on registry'

  static examples = [
    `$ immu did:addkey <did> `,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    privateKey: flags.string({ char: 'p', required: true, description: 'a private key that controls the identity that should receive a new key' }),
  }

  async run() {
    const { args, flags } = this.parse(AddKey);
    const privateKey = await requestAndResolvePrivateKey(flags.privateKey);

    const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();

    const tx = await Ed25519Signing.registerKey(resolver, privateKey, edKeyPair);

    console.log("key details", await edKeyPair.toKeyPair(true));
    //todo: this is now stuck on a "development" network)
    console.log("new did doc",await resolver.resolve(`did:ethr:development:${tx.from}`));
  }
}