import { Command, flags } from '@oclif/command'
import { Issuer } from '@immu/authority';

export default class Issue extends Command {
  static description = 'issues a claim'

  static examples = [
    `$ immu issue <private key> --issuer --subject`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    issuer: flags.string({ required: true, description: 'the issuers address' }),
    subject: flags.string({ required: true, description: 'the claims subject address' }),
  }

  static args = [{
    name: 'privateKey',
  }]

  async run() {
    const { args, flags } = this.parse(Issue)

    const issuer = new Issuer(process.env.ETHEREUM_NODE!, process.env.REGISTRY!);

    const verifiedCredential = await issuer.issueAuthority(
      args.privateKey,
      flags.issuer,
      flags.subject
    )

    console.log(verifiedCredential);
  }
}
