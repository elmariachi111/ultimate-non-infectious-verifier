import { Command } from '@oclif/command'
import { Verifier, VerifiedCredential } from '@immu/authority';

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

    const verifier = new Verifier(process.env.ETHEREUM_NODE!, process.env.REGISTRY!);

    const verifiedCredential: VerifiedCredential = await verifier.verifyClaim(args.jwt);

    console.debug(verifiedCredential);
    console.log(verifiedCredential.payload.vc);
  }
}
