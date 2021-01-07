import { Command, flags } from '@oclif/command'
import { Issuer, Resolver } from '@immu/core';
import { readFileSync } from 'fs';
//@ts-ignore
import * as roles from '../../aliases.json';

import cli from 'cli-ux'
import resolver from '../resolver';

export default class Issue extends Command {
  static description = 'issues a claim'

  static examples = [
    `$ immu issue <private key> --issuer --subject`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    privateKey: flags.string({ char: 'p', description: 'provide a private key' }),
    subject: flags.string({ char: 's', required: true, description: 'the subject address' }),
  }

  static args = [
    { name: 'claim' }
  ]

  async run() {
    const { args, flags } = this.parse(Issue)

    const claim = JSON.parse(
      readFileSync(args.claim, 'utf-8')
    );

    let privateKey: string = flags.privateKey
      || await cli.prompt('Enter your private key', {
        type: 'hide'
      });
    if (!privateKey.startsWith('0x')) {
      //@ts-ignore
      privateKey = roles[privateKey]['privateKey'];
    }

    const subject = (flags.subject.startsWith('0x'))
      ? flags.subject
      //@ts-ignore
      : roles[flags.subject].account
    const issuer = new Issuer(resolver, privateKey);

    const credential = await issuer.issueCredential(
      subject,
      claim
    )

    const verifiedCredential = await issuer.createJwt(credential);
    console.log(verifiedCredential);
  }
}
