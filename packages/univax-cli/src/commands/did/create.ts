import { Command, flags } from '@oclif/command';
import * as fs from 'fs';

import { Ed25519Signing } from '@univax/core';

export default class Create extends Command {
  static description = 'creates a new Ed25519 based did:key DID';

  static examples = ['$ immu did:create '];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
  };

  async run() {
    const { flags } = this.parse(Create);

    const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();
    const did = `did:key:${edKeyPair.fingerprint()}`;
    console.log('new did', did);
    const keyPair = JSON.stringify(edKeyPair.toKeyPair(true));
    fs.writeFileSync(`${edKeyPair.fingerprint()}.key.json`, keyPair);
    console.log('saved keypair', keyPair);
  }
}
