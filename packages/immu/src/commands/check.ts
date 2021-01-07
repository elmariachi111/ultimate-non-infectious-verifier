import { Command } from '@oclif/command'
import { Verifier, VerifiedCredential } from '@immu/core';
import { readFileSync } from 'fs';

export default class CheckJwtChain extends Command {
  static description = 'verifies a JWT claim and the whole signature chain'

  static examples = [
    `$ immu check <jwt-collection-file>`,
  ]

  static args = [{
    name: 'jwtCollectionFile',
  }]

  async run() {

    const { args } = this.parse(CheckJwtChain)
    const jwts = JSON.parse(
      readFileSync(args.jwtCollectionFile, 'utf-8')
    );

    const verifier = new Verifier(process.env.ETHEREUM_NODE!, process.env.REGISTRY!);

    const verified = {
      patient: await verifier.verifyClaim(jwts.patient),
      provider: await verifier.verifyClaim(jwts.provider),
      site: await verifier.verifyClaim(jwts.site),
    }


    console.log(verified);
  }
}
