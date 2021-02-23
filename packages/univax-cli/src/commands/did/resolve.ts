import { Command } from '@oclif/command';
import { getSidetreeElemMethod, resolver } from '../../resolver';
import { GetSidetreeElementResolver } from '@univax/core';

export default class Resolve extends Command {
  static description = `
    resolves a did (or eth address). 
    Support methods atm: [ethr|key|elem]
  `

  static examples = [
    `$ immu did:resolve <did:ethr:development:0xabcde>`,
  ]

  static args = [{
    name: 'did',
    required: true
  }]

  async run() {
    const { args } = this.parse(Resolve);

    const sidetreeElemMethod = await getSidetreeElemMethod();
    resolver.addResolvers(GetSidetreeElementResolver(sidetreeElemMethod));

    const didDoc = await resolver.resolve(args.did);
    console.log(JSON.stringify(didDoc, null, 2));

    await sidetreeElemMethod.close();
  }
}
