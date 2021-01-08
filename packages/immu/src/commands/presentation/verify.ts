import { Verifier } from '@immu/core';
import { Command } from '@oclif/command';
import resolver from '../../resolver';


export default class VerifyPresentation extends Command {
  static description = 'verifies a JWT encoded vp'

  static examples = [
    `$ immu presentation:verify <jwt-presentation>`,
  ]

  static args = [{
    name: 'jwt',
  }]

  async run() {

    const { args } = this.parse(VerifyPresentation)

    const verifier = new Verifier(resolver);

    const verified = {
      patient: await verifier.verifyPresentation(args.jwt),
    }

    console.log(verified);
  }
}
