import { Command } from '@oclif/command'
import { Verifier, VerifiedCredential, displayCredential } from '@immu/core';
import { resolver } from '../resolver';
import { readFileSync } from 'fs';

export default class VerifyJson extends Command {
  static description = 'verifies a JSON based credential with inline proof'

  static examples = [
    `$ immu verifyJson <.json file>`,
  ]

  static args = [{
    name: 'file',
  }]

  async run() {
    const { args } = this.parse(VerifyJson)
    const jsonFile = await readFileSync(args.file, 'utf-8');
    const verifiedCredential = JSON.parse(jsonFile);

    const verifier = new Verifier(resolver);
    const isValid = await verifier.verifyJsonCredential(verifiedCredential)
    console.log(displayCredential(verifiedCredential));
    console.log(isValid);

  }
}
