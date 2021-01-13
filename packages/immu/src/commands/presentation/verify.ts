import { Verifier } from '@immu/core';
import { Command, flags } from '@oclif/command';
import resolver from '../../resolver';


export default class VerifyPresentation extends Command {
  static description = 'verifies a JWT encoded vp'

  static examples = [
    `$ immu presentation:verify -v verifierDID <jwt-presentation>`,
  ]

  static flags = {
    verifier: flags.string({char: 'v', description: "the verifier DID (you)"}),
  }

  static args = [{
    name: 'jwt',
  }]

  async run() {

    const { args, flags } = this.parse(VerifyPresentation)

    const verifier = new Verifier(resolver, flags.verifier);

    const verified = await verifier.verifyPresentation(args.jwt);
    
    if (verified.payload.proof?.challenge) {
      console.log(`presented with challenge ${verified.payload.proof?.challenge}`)
    }

    //the presentation verifier only validates wether the presented credentials have
    //a valid format.
    for await (const credential of verified.verifiablePresentation.verifiableCredential) {
      console.log(credential);
    }

    //console.log(verified);
  }
}
