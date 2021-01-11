import { Command, flags } from '@oclif/command';
import resolver from '../../resolver';
import * as roles from '../../../aliases.json';

import { cli } from 'cli-ux';
import * as crypto from 'crypto';


import {Ed25519Signing} from '@immu/core';

export default class AddKey extends Command {
  static description = 'creates a new Ed25519 keypair for signing'

  static examples = [
    `$ immu did:addkey <did> `,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd', description: 'display debug info' }),
    //privateKey: flags.string({ char: 'p', required: true, description: 'provide a private key' }),
  }

  static args = [{
    name: 'did', required: true,
  }]

  async run() {
    const { args, flags } = this.parse(AddKey);
    // let privateKey: string = flags.privateKey
    //   || await cli.prompt('Enter your private key', {
    //     type: 'hide'
    //   });
    // if (!privateKey.startsWith('0x')) {
    //   //@ts-ignore
    //   privateKey = roles[privateKey]['privateKey'];
    // }

    //const seed = Uint8Array.from(Web3.utils.hexToBytes(Web3.utils.randomHex(32)));
    const seed = await crypto.randomBytes(32);
    const edKeyPair = await Ed25519Signing.createEd25519VerificationKey(seed, args.did);
    const exported = await edKeyPair.export({ publicKey: true, privateKey: true });
    console.log(exported)  

    

  }
}



    //const keyPair = await resolver.transmuteAddEd25519VerificationKey(privateKey);
    //console.log(keyPair);