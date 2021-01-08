import { Command, flags } from '@oclif/command';
import resolver from '../../resolver';
import * as roles from '../../../aliases.json';

import { cli } from 'cli-ux';

export default class Attribute extends Command {
  static description = 'resolves an (ethr) did'

  static examples = [
    `$ immu attribute `,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    privateKey: flags.string({ char: 'p', required: true, description: 'provide a private key' }),
  }


  async run() {
    const { flags } = this.parse(Attribute);
    let privateKey: string = flags.privateKey
      || await cli.prompt('Enter your private key', {
        type: 'hide'
      });
    if (!privateKey.startsWith('0x')) {
      //@ts-ignore
      privateKey = roles[privateKey]['privateKey'];
    }

    const keyPair = await resolver.addEd25519VerificationKey(privateKey);
    console.log(keyPair);
  }
}
