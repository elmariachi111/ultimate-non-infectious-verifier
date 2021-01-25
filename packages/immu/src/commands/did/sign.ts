import { Ed25519Signing, PublicKey } from '@immu/core';
import { Command, flags } from '@oclif/command';
import * as base58 from 'bs58';
import * as inquirer from 'inquirer';
import resolver from '../../resolver';


export default class Sign extends Command {
  static description = 'creates a new ed25519 signature on message. Asks for private keys'

  static examples = [
    `$ immu did:sign <did> <message>`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
  }

  static args = [
    {name: 'did', required: true},
    {name: 'message', required: true}
  ]

  async run() {
    const { flags, args } = this.parse(Sign);
   
    const did = await resolver.resolve(args.did);
    if (!did.authentication) {
      console.error("no authentication methods found in your did");
      return;
    }
 
    const authOptions = did.publicKey
      .map( (pubKey: PublicKey) => ({  
        name: `(${pubKey.type}) ${pubKey.id}`,
        value: pubKey
      }));

    const prompt = inquirer.createPromptModule();
    const {signingKey} = await prompt([{
      type: "list",
      name: "signingKey",
      message: "signing key to use",
      choices: authOptions
    }]);
    
    const { signingPrivateKey } = await prompt([{
      message: `private key (base58) for ${signingKey.id}`,
      name: "signingPrivateKey",
      type: "input"
    }])
    
    const edKeyPair = await Ed25519Signing.recoverEd25519KeyPair(signingKey, signingPrivateKey);
    const signature = await edKeyPair.signer().sign({
      data: args.message
    });

    console.log({
      did: did.id,
      message: args.message,
      signature: base58.encode(signature)
    });
  }
}