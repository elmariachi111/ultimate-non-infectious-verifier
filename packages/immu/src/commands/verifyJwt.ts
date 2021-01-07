import { Command } from '@oclif/command'
import { Verifier, VerifiedCredential } from '@immu/core';
import resolver from '../resolver';

export default class VerifyJwt extends Command {
  static description = 'verifies a JWT claim'

  static examples = [
    `$ immu verify <jwt>`,
  ]

  static args = [{
    name: 'jwt',
  }]

  async run() {
    const { args } = this.parse(VerifyJwt)

    const verifier = new Verifier(resolver);

    const verifiedCredential: VerifiedCredential = await verifier.verifyCredential(args.jwt);

    console.debug(verifiedCredential);
    console.log(verifiedCredential.payload.vc);
  }
}
