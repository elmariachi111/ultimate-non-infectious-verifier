import { Issuer } from '@immu/core';
import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
//@ts-ignore
import * as roles from '../../../aliases.json';
import resolver from '../../resolver';

export default class CreatePresentation extends Command {
  static description = 'Creates a signed presentation out of several credentials'

  
  static examples = [
    `$ immu presentation:create -p <private-key> [jwt] [jwt] [jwt]`,
  ]
  static strict = false;

  static flags = {
    debug: flags.boolean({char: 'd'}),
    help: flags.help({ char: 'h' }),
    privateKey: flags.string({ char: 'p', required: true, description: 'provide a private key' }),
  }

  async run() {
    const { argv, flags } = this.parse(CreatePresentation);
    console.log(argv);

    let privateKey: string = flags.privateKey
      || await cli.prompt('Enter your private key', {
      type: 'hide'
    });
    
    if (!privateKey.startsWith('0x')) {
      //@ts-ignore
      privateKey = roles[privateKey]['privateKey'];
    }

    const issuer = new Issuer(resolver, privateKey);

    const presentationPayload = await issuer.createPresentation(argv as string[]);
    if (flags.debug)
      console.debug(JSON.stringify(presentationPayload, null, 2));

    const presentationJwt = await issuer.createPresentationJwt(presentationPayload);
    console.log(presentationJwt);
  }
}
