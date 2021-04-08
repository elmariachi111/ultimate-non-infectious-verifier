import { Command, flags } from '@oclif/command';
import { Ed25519Signing } from '@univax/core';
import { CreateSidetreeElemDid } from '@univax/sidetree';
import * as fs from 'fs';
import { promptForPassword } from '../../helpers/prompts';
import jolocom from '../../methods/jolocom';
import sidetree from '../../methods/sidetree';

export default class Create extends Command {
  static description = 'creates a new did DID (implementation depends on method)';

  static examples = ['$ immu did:create '];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    type: flags.enum({options: ['key', 'elem', 'jun', 'jolo'], char: 't', description: 'did type', default: 'key'}),
    password: flags.string({required: false})
  };
  
  async run() {
    const { flags } = this.parse(Create);
    let did: string | undefined;
    let keyFile: string | undefined;
    let passphrase;

    switch (flags.type) {
      case 'elem': 
        const didMethod = await sidetree;
        if (!didMethod) {
          throw Error("Sidetree is not configured");
        }
        const didResult = await CreateSidetreeElemDid(didMethod);
        did = didResult.shortFormDid;
        keyFile = JSON.stringify(didResult, null, 2);
        await didMethod.close();
      break;

      case 'jun': case 'jolo': 
        const sdk = await jolocom;
        const passphrase = flags.password ?? await promptForPassword();
        const agent = await sdk.createAgent(passphrase, flags.type);
        console.log(agent.idw.didDocument.toJSON());

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

    this.exit();
  }
}