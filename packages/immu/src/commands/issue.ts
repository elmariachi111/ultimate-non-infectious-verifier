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
    `$ immu issue -p <private key> -s <subject did> [CLAIM]`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    proofType: flags.string({ char: 't', required: false, default: "jwt", description: 'how the proof is presented (default jwt)' }),
    privateKey: flags.string({ char: 'p', required: true, description: 'provide a private key' }),
    subject: flags.string({ char: 's', required: true, description: 'the subject DID' }),
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

    const subjectDid = (flags.subject.startsWith('did:'))
      ? flags.subject
      //@ts-ignore
      : roles[flags.subject].did
    const issuer = new Issuer(resolver, privateKey);

    const credential = await issuer.issueCredential(
      subjectDid,
      claim
    )

    if (flags.debug)
      console.debug(JSON.stringify(credential, null, 2));

    const verifiedCredential = await issuer.createJwt(credential);
    console.log(verifiedCredential);
  }
}
