import { Issuer } from '@univax/core';
import { Command, flags } from '@oclif/command';
import { chooseDidFromRoles, chooseSigningKey, requestAndResolvePrivateKey } from '../../helpers/prompts';
// @ts-ignore
import { resolver } from '../../resolver';
import { PresentationRequest } from '@univax/core';
import cli from 'cli-ux';
import { readFileSync } from 'fs';

export default class CreatePresentation extends Command {
  static description = 'Creates a signed presentation out of several credentials';

  static examples = ['$ immu presentation:create [presentationRequest]'];

  static strict = false;

  static flags = {
    debug: flags.boolean({ char: 'd' }),
    help: flags.help({ char: 'h' }),
    prover: flags.string({ char: 'p', required: false, description: 'prover did' }),
  };

  static args = [{name: 'presentationRequest', required: true}];

  async run() {
    const { args, flags } = this.parse(CreatePresentation);

    const presentationRequest: PresentationRequest = JSON.parse(readFileSync(args.presentationRequest, 'utf-8'));
    const proverDid = await chooseDidFromRoles(flags.prover);

    const presentableCredentials: { [k: string]: string } = {}
    for await (const subject of presentationRequest.requestedSubjects) {
      presentableCredentials[subject] = await cli.prompt(`provide a *${subject}* credential`);
    }

    const issuer = new Issuer(resolver, proverDid);

    const presentationPayload = await issuer.createPresentation(Object.values(presentableCredentials));

    // this would add an aud field to the jwt but it doesn't seem to work well...
    // presentationPayload.verifier = presentationRequest.requester
    presentationPayload.proof = {
      challenge: presentationRequest.challenge
    }

    const { signingPrivateKey } = await chooseSigningKey(await issuer.resolveIssuerDid());
    const presentationJwt = await issuer.createPresentationJwt(presentationPayload, signingPrivateKey);
    console.log(presentationJwt);
  }
}
