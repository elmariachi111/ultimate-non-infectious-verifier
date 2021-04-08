import { Command } from '@oclif/command';
import { resolver } from '../../resolver';
import {chooseDidFromJolocomSdk} from '../../helpers/prompts';

export default class List extends Command {
  static description = `lists all dids from a (jolocom) wallet`
  static examples = [
    `$ univax did:list`,
  ]

  async run() {
    
    const did = await chooseDidFromJolocomSdk();
    const didDoc = await resolver.resolve(did);

    console.log(JSON.stringify(didDoc, null, 2));

    this.exit()
  }
}