import { Command, flags } from '@oclif/command'
import { Ed25519Signing, Issuer, Resolver } from '@immu/core';
import { readFileSync, writeFileSync } from 'fs';
//@ts-ignore
import * as roles from '../../aliases.json';

import * as inquirer from 'inquirer';
import resolver from '../resolver';
import requestAndResolvePrivateKey from '../helpers/resolvePrivateKey';
//@ts-ignore


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

    const privateKey = await requestAndResolvePrivateKey(flags.privateKey);

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

    let jsonVerifiedCredential;

    if (flags.proofType == 'jwt') {
      jsonVerifiedCredential = await issuer.createJwt(credential);     
    } else {
      const issuerDid = await issuer.resolveIssuerDid();
      const prompt = inquirer.createPromptModule();
      const { signingKey: signingKeyChoice } = await prompt([{
        type: "list",
        name: "signingKey",
        message: "signing key to use",
        choices: issuerDid.publicKey.map(publicKey => ({ name: publicKey.id, value: publicKey.id }))
      }]);
      const [signingKey] = issuerDid.publicKey.filter(pk => pk.id == signingKeyChoice);

      const { signingPrivateKey } = await prompt([{
        message: `private key (base58) for ${signingKey.id}`,
        name: "signingPrivateKey",
        type: "input"
      }])

      const keyPair = await Ed25519Signing.recoverEd25519KeyPair(signingKey, signingPrivateKey);

      //create proof over credential
      const jsonCredential = JSON.stringify(credential, null, 2);
      
      const jws = await Ed25519Signing.sign(jsonCredential, keyPair);

      const proof = {
        type: 'Ed25519Signature2018',
        verificationMethod: signingKey.id,
        created: (new Date()).toISOString(),
        proofPurpose: 'assertionMethod',
        jws
      };

      const verifiedCredential = {
        ...credential,
        proof
      }
      jsonVerifiedCredential = JSON.stringify(verifiedCredential, null, 2);
    }

    if (flags.out) {
      writeFileSync(flags.out,jsonVerifiedCredential,'utf-8');
    } else {
      console.log(jsonVerifiedCredential);
    }
  }
}
