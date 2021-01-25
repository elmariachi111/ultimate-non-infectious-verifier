import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as base58 from 'bs58';

import { Ed25519Signing, PublicKey, Authentication, DIDDocument } from '@immu/core';
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
 
    const authOptions = did.authentication.map( (auth: string | Authentication |PublicKey ) => {  
      if (typeof auth === "string") return auth;
      return (<Authentication>auth).publicKey;
    })

    const prompt = inquirer.createPromptModule();
    const {signingKeyChoice} = await prompt([{
      type: "list",
      name: "signingKeyChoice",
      message: "signing key to use",
      choices: authOptions
    }]);
    
    const [signingKey] = did.publicKey.filter(pk => pk.id == signingKeyChoice);

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