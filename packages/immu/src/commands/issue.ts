import { Command, flags } from '@oclif/command'
import { Issuer } from '@immu/core';
import { readFileSync } from 'fs';
import cli from 'cli-ux'

export default class Issue extends Command {
  static description = 'issues a claim'

  static examples = [
    `$ immu issue <private key> --issuer --subject`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    privateKey: flags.string({ char: 'p', description: 'provide a private key' }),
    subject: flags.string({ required: true, description: 'the subject address' }),
  }

  static args = [
    { name: 'claim' }
  ]

  async run() {
    const { args, flags } = this.parse(Issue)

    const claim = JSON.parse(
      readFileSync(args.claim, 'utf-8')
    );

    const privateKey = flags.privateKey
      || process.env.PRIVATE_KEY
      || await cli.prompt('Enter your private key', {
        type: 'hide'
      });

    const issuer = new Issuer(process.env.ETHEREUM_NODE!, process.env.REGISTRY!, privateKey);

    const verifiedCredential = await issuer.issueClaim(
      flags.subject,
      claim
    )

    console.log(verifiedCredential);
  }
}
