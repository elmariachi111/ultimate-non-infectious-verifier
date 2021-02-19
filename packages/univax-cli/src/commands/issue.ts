import { Issuer } from '@univax/core';
import { Command, flags } from '@oclif/command';
import { readFileSync, writeFileSync } from 'fs';
// @ts-ignore
import * as roles from '../../aliases.json';
import { issueCredential } from '../helpers/issueCredential';
import { chooseDidFromRoles } from '../helpers/prompts';
import { resolver } from '../resolver';

export default class Issue extends Command {
  static description = 'issues a generic credential. Asks for private keys';

  static examples = ['$ immu issue -s <subject did> -i <issuer did> [CLAIM.json]'];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    proofType: flags.string({ char: 'p', required: false, default: 'jwt', description: 'proof type (jwt|jws)' }),
    issuer: flags.string({ char: 'i', required: false, description: 'issuer did' }),
    privateKey: flags.string({ char: 'k', required: false, description: 'provide a private key' }),
    subject: flags.string({ char: 's', required: true, description: 'the subject DID' }),
    out: flags.string({ char: 'o', required: false, description: 'write to file'}),
    credentialType: flags.string({
      char: 't',
      required: false,
      default: '',
      description: 'credential schema type, comma separated'
    })
  };

  static args = [{name: 'claim', required: true}];

  async run() {
    const { args, flags } = this.parse(Issue)

    const claim = JSON.parse(readFileSync(args.claim, 'utf-8'))

    const subjectDid = flags.subject.startsWith('did:') ?
      flags.subject // @ts-ignore
      roles[flags.subject].did

    const issuerDid = await chooseDidFromRoles(flags.issuer)
    const issuer = new Issuer(resolver, issuerDid);

    const credential = await issuer.issueCredential(
      subjectDid,
      claim,
      flags.credentialType ? flags.credentialType.split(',') : [],
    )

    issueCredential(credential, issuer, flags);
  }
}
