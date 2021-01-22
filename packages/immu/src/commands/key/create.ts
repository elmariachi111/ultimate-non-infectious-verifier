import { Command, flags } from '@oclif/command';
import * as crypto from 'crypto';

import { Ed25519Signing } from '@immu/core';

export default class Create extends Command {
  static description = 'creates a new Ed25519 based did:key DID'

  static examples = [
    `$ immu key:create `,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
  }

  async run() {
    const { flags } = this.parse(Create);
   
    const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();
    const did = `did:key:${edKeyPair.fingerprint()}`;
    console.log("new did", did);
    console.log("keys", edKeyPair.toKeyPair());

  }
}