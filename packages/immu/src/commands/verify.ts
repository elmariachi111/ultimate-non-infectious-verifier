import { Command, flags } from '@oclif/command'
import { Verifier, VerifiedCredential, displayCredential, W3CCredential } from '@immu/core';
import { resolver } from '../resolver';
import { readFileSync } from 'fs';

export default class Verify extends Command {
  static description = 'verifies a credential'

  static examples = [
    `$ immu verify [-j] <jwt|json file>`,
  ]

  static flags ={
    jwt: flags.boolean({ char: 'j', name: "jwt", description: "arg is a plain jwt string" }),
  }

  static args = [{
    name: 'jwtOrFile', required: true
  }]

  async run() {
    const { args, flags } = this.parse(Verify)

    const verifier = new Verifier(resolver);
    
    const credential = flags.jwt 
      ? args.jwtOrFile 
      : JSON.parse(readFileSync(args.jwtOrFile, 'utf-8'));

    const verifiedCredential = await verifier.verifyCredential(credential);
    console.log(displayCredential(verifiedCredential));
    console.log("isValid", true);// verifier will throw an error if jwt cant be verified
  }
}
