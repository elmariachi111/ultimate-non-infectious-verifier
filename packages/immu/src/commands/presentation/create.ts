import { Issuer } from '@immu/core';
import { Command, flags } from '@oclif/command';
import requestAndresolvePrivateKey from '../../helpers/resolvePrivateKey';
//@ts-ignore
import resolver from '../../resolver';
import {PresentationRequest} from '@immu/core';
import cli from 'cli-ux';
import {readFileSync} from 'fs';

export default class CreatePresentation extends Command {
  static description = 'Creates a signed presentation out of several credentials'

  static examples = [
    `$ immu presentation:create -p <private-key> [presentationRequest]`,
  ]
  static strict = false;

  static flags = {
    debug: flags.boolean({char: 'd'}),
    help: flags.help({ char: 'h' }),
    privateKey: flags.string({ char: 'p', description: 'provide a private key' }),
  }

  static args = [
    {"name": "presentationRequest"}
  ]
  async run() {
    const { args, flags } = this.parse(CreatePresentation);
    
    const privateKey = await requestAndresolvePrivateKey(flags.privateKey);

    const presentationRequest: PresentationRequest = JSON.parse(readFileSync(args.presentationRequest, 'utf-8'));

    const presentableCredentials: {[k: string]: string} = {}
    for await (const subject of presentationRequest.requestedSubjects) {
      presentableCredentials[subject] = await cli.prompt(`provide a *${subject}* credential`);
    }

    const issuer = new Issuer(resolver, privateKey);

    const presentationPayload = await issuer.createPresentation(Object.values(presentableCredentials));

    //this would add an aud field to the jwt but it doesn't seem to work well...
    //presentationPayload.verifier = presentationRequest.requester

    presentationPayload.proof = {
      challenge: presentationRequest.challenge
    }

    const presentationJwt = await issuer.createPresentationJwt(presentationPayload);
    console.log(presentationJwt);
  }
}
