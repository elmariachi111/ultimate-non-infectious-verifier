import { Issuer } from '@immu/core';
import { Command, flags } from '@oclif/command';
import { readFileSync, writeFileSync } from 'fs';
//@ts-ignore
import * as roles from '../../aliases.json';
import { chooseDidFromRoles, chooseSigningKey, requestAndResolvePrivateKey } from '../helpers/prompts';
import { resolver } from '../resolver';


export default class Issue extends Command {
  static description = 'issues a claim. Asks for private keys'

  static examples = [
    `$ immu issue -s <subject did> -i <issuer did> [CLAIM.json]`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    proofType: flags.string({ char: 't', required: false, default: "jwt", description: 'proof type (jwt|jws)' }),
    issuer: flags.string({ char: 'i', required: false, description: 'issuer did' }),
    privateKey: flags.string({ char: 'p', required: false, description: 'provide a private key' }),
    subject: flags.string({ char: 's', required: true, description: 'the subject DID' }),
    out: flags.string({ char: 'o', required: false, description: "write to file" }),
  }

  static args = [
    { name: 'claim' }
  ]

  async run() {
    const { args, flags } = this.parse(Issue)

    const claim = JSON.parse(
      readFileSync(args.claim, 'utf-8')
    );

    const subjectDid = (flags.subject.startsWith('did:'))
      ? flags.subject
      //@ts-ignore
      : roles[flags.subject].did

    const issuerDid = await chooseDidFromRoles(flags.issuer)

    const issuer = new Issuer(resolver, issuerDid);

    const credential = await issuer.issueCredential(
      subjectDid,
      claim
    )

    if (flags.debug)
      console.debug(JSON.stringify(credential, null, 2));

    let jsonVerifiedCredential;

    if (flags.proofType == 'jwt') {
      const privateKey = await requestAndResolvePrivateKey(flags.privateKey);
      jsonVerifiedCredential = await issuer.createJwt(credential, privateKey);
    } else if (flags.proofType == 'jws') {
      const { signingKey, signingPrivateKey } = await chooseSigningKey(await issuer.resolveIssuerDid());
      jsonVerifiedCredential = await issuer.createJsonProof(credential, signingKey, signingPrivateKey);
    }

    if (flags.out) {
      writeFileSync(flags.out, jsonVerifiedCredential, 'utf-8');
    } else {
      console.log(jsonVerifiedCredential);
    }
  }
}
