import { Command } from '@oclif/command';
import resolver from '../../resolver';

export default class Resolve extends Command {
  static description = 'resolves an (ethr) did (or address)'

  static examples = [
    `$ immu resolve <did:ethr:development:0xabcde>`,
  ]

  static args = [{
    name: 'did',
    required: true
  }]

  async run() {
    const { args } = this.parse(Resolve);

    const didDoc = await resolver.resolve(args.did);
    console.log(didDoc);
  }
}
