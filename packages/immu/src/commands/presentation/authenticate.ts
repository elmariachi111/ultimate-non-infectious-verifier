import { Issuer } from '@immu/core';
import { Command, flags } from '@oclif/command';
import { chooseDidFromRoles, chooseSigningKey, requestAndResolvePrivateKey } from '../../helpers/prompts';
//@ts-ignore
import { resolver } from '../../resolver';
import { PresentationRequest } from '@immu/core';
import cli from 'cli-ux';
import { readFileSync } from 'fs';

export default class Authenticate extends Command {
  static description = 'creates an authentication request by some did'

  static examples = [
    `$ immu presentation:authenticate `,
  ]
  static strict = false;

  static flags = {
    debug: flags.boolean({ char: 'd' }),
    help: flags.help({ char: 'h' }),
    requester: flags.string({ char: 'r', required: true, description:"the requester DID"})
  }

  static args = [

  ]
  
  async run() {
    const { args, flags } = this.parse(Authenticate);

    const requesterDid = await chooseDidFromRoles(flags.requester);
    const did = await resolver.resolve(requesterDid);
    const privateKey = await chooseSigningKey(did)
    
    const issuer = new Issuer(resolver, requesterDid);
    const jwt = await issuer.createAnyJwt({
      typ: "authentication",
      "interaction": {
        "nonce": "abcde"
      }
    }, privateKey.signingPrivateKey);

    console.log(jwt);
  }
}
