import { Command, flags } from '@oclif/command'
import { Verifier } from '@immu/authority';

export default class VerifyJwt extends Command {
  static description = 'verifies a JWT claim'

  static examples = [
    `$ immu verify <jwt>`,
  ]

  static args = [{
    name: 'jwt',
  }]

  async run() {
    const { args, flags } = this.parse(VerifyJwt)

    const verifier = new Verifier(process.env.ETHEREUM_NODE!, process.env.REGISTRY!);

    const verifiedCredential = await verifier.verifyClaim(args.jwt);

    console.log(verifiedCredential);
  }
}
