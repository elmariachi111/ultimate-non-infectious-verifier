import { Command, flags } from '@oclif/command'
import { Verifier, VerifiedCredential, displayCredential, W3CCredential, Jolocom } from '@univax/core';
import { resolver } from '../resolver';
import { readFileSync } from 'fs';
import jolocom from '../methods/jolocom';

import { promptForPassword } from '../helpers/prompts';

export default class Verify extends Command {
  static description = 'verifies a credential';

  static examples = ['$ univax verify [-j] <jwt|json file>'];

  static flags = {
    jwt: flags.boolean({ char: 'j', name: 'jwt', description: 'arg is a plain jwt string' })
  };

  static args = [
    {
      name: 'jwtOrFile',
      required: true
    },
  ];

  async run() {
    const { args, flags } = this.parse(Verify)

    const verifier = new Verifier(resolver);

    const credential = flags.jwt ? args.jwtOrFile : JSON.parse(readFileSync(args.jwtOrFile, 'utf-8'))

    if (!flags.jwt && typeof credential.issuer === 'string' && Jolocom.isJolocomDid(credential.issuer)) {
      const sdk = await jolocom;
      const passphrase = await promptForPassword();
      const agent = await sdk.loadAgent(passphrase);
      await Jolocom.validate(credential, agent.idw.identity);
    } else {
      const verifiedCredential = await verifier.verifyCredential(credential);
      console.log(displayCredential(verifiedCredential));
      console.log('isValid', true); // verifier will throw an error if jwt cant be verified
    }   
  }
}
