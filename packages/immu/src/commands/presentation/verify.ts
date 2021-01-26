import { Verifier } from '@immu/core';
import { Command, flags } from '@oclif/command';
import { resolver } from '../../resolver';


export default class VerifyPresentation extends Command {
  static description = 'verifies a JWT encoded vp'

  static examples = [
    `$ immu presentation:verify <jwt-presentation>`,
  ]

  static flags = {
  }

  static args = [{
    name: 'jwt', required: true
  }]

  async run() {

    const { args, flags } = this.parse(VerifyPresentation)

    const verifier = new Verifier(resolver);

    const verified = await verifier.verifyPresentation(args.jwt);

    console.log('presented credentials: ', verified.verifiablePresentation.verifiableCredential.length);
    console.log('presented by:', verified.issuer)
    console.log('holder:', verified.verifiablePresentation.holder)
    if (verified.payload.proof?.challenge) {
      console.log('presented challenge', verified.payload.proof?.challenge)
    }

    //the presentation verifier only validates whether the presented credentials have
    //a valid format.
    for await (const credential of verified.verifiablePresentation.verifiableCredential) {
      console.log(JSON.stringify(credential, null, 2));
    }

    //todo: verify the expected semantics of the presentation
    //console.log(verified);
  }
}
