import { createRequest } from '@immu/core';
import { Command, flags } from '@oclif/command';
import { chooseDidFromRoles } from '../../helpers/prompts';


/**
 * todo
 * - check wether there's any kind of standard for this
 * - let the verifier prove that he's an authorized verifier, self signed would be ok.
 */
export default class PresentationRequest extends Command {
  static description = 'Requests a subject to create a verifiable presentation of [credentialType]'


  static examples = [
    `$ immu presentation:request -v verifierDID immunization,provider,site `,
  ]
  static strict = false;

  static flags = {
    debug: flags.boolean({ char: 'd' }),
    help: flags.help({ char: 'h' }),
    verifier: flags.string({ char: 'v', description: "the verifier DID (you)" }),
  }

  static args = [
    { name: "credentialType", required: true, description: "a comma separated list of claim names" }
  ]

  async run() {
    const { args, flags } = this.parse(PresentationRequest);

    const verifier = await chooseDidFromRoles(flags.verifier);
    const presentationRequest = createRequest(verifier, args.credentialType.split(","));
    console.log(JSON.stringify(presentationRequest, null, 2));
  }
}
