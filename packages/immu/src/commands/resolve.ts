import { Command } from '@oclif/command';
import resolver from '../resolver';

export default class Resolve extends Command {
  static description = 'resolves an ethr did'

  static examples = [
    `$ immu resolve <address>`,
  ]

  static args = [{
    name: 'address',
    required: true
  }]

  async run() {
    const { args } = this.parse(Resolve)

    const didDoc = await resolver.getDid(args.address);
    console.log(didDoc);
  }
}
