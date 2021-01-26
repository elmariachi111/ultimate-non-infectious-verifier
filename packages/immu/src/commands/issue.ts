import { Command, flags } from '@oclif/command'
import { Ed25519Signing, Issuer, Resolver, Secp256k1Signing } from '@immu/core';
import { readFileSync, writeFileSync } from 'fs';
//@ts-ignore
import * as roles from '../../aliases.json';

import * as inquirer from 'inquirer';
import resolver from '../resolver';
import {requestAndResolvePrivateKey, chooseDidFromRoles, chooseSigningKey} from '../helpers/prompts';
//@ts-ignore


export default class Issue extends Command {
  static description = 'issues a claim. Asks for private keys'

  static examples = [
    `$ immu issue -s <subject did> -i <issuer did> [CLAIM.json]`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    proofType: flags.string({ char: 't', required: false, default: "jwt", description: 'proof type (jwt|jws)' }),
    issuer: flags.string({char: 'i', required: false, description: 'issuer did'}),
    privateKey: flags.string({ char: 'p', required: false, description: 'provide a private key' }),
    subject: flags.string({ char: 's', required: true, description: 'the subject DID' }),
    out: flags.string({char: 'o', required: false, description: "write to file"}),
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
    const privateKey = await requestAndResolvePrivateKey(flags.privateKey);
    
    const issuer = new Issuer(resolver, privateKey);

    const credential = await issuer.issueCredential(
      subjectDid,
      claim
    )

    if (flags.debug)
      console.debug(JSON.stringify(credential, null, 2));

    let jsonVerifiedCredential;

    if (flags.proofType == 'jwt') {
      jsonVerifiedCredential = await issuer.createJwt(credential);     
    } else if (flags.proofType == 'jws') {
      const {signingKey, signingPrivateKey} = await chooseSigningKey(await issuer.resolveIssuerDid());
      jsonVerifiedCredential = await issuer.createJsonProof(credential, signingKey, signingPrivateKey);
    }

    if (flags.out) {
      writeFileSync(flags.out,jsonVerifiedCredential,'utf-8');
    } else {
      console.log(jsonVerifiedCredential);
    }
  }
}
