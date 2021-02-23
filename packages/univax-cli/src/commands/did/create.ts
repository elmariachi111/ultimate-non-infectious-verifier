import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import { Ed25519Signing, CreateSidetreeElemDid } from '@univax/core';
import { getSidetreeElemMethod } from '../../resolver';

export default class Create extends Command {
  static description = 'creates a new Ed25519 based did:key DID';

  static examples = ['$ immu did:create '];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    type: flags.enum({options: ['key', 'elem'], char: 't', description: 'did type', default: 'key'}),
  };
  
  async run() {
    const { flags } = this.parse(Create);
    let did: string | undefined;
    let keyFile: string | undefined;

    switch (flags.type) {
      case 'elem': 
        const didMethod = await getSidetreeElemMethod();
        const didResult = await CreateSidetreeElemDid(didMethod);
        did = didResult.shortFormDid;
        keyFile = JSON.stringify(didResult, null, 2);
        await didMethod.close();
      break;

      case 'key': case 'default': 
        const edKeyPair = await Ed25519Signing.createEd25519VerificationKey();
        did = `did:key:${edKeyPair.fingerprint()}`;
        keyFile = JSON.stringify(edKeyPair.toKeyPair(true));
      break;
    } 

    if (did) {
      console.log('keyfile', keyFile);
      fs.writeFileSync(`${did}.key.json`, keyFile);
    }
  }
}
