import { Command } from '@oclif/command'
import { Verifier, VerifiedCredential } from '@univax/core';
import { readFileSync } from 'fs';
import resolver from '../../resolver';

export default class CheckJwtChain extends Command {
  static description = 'verifies a JWT claim and the whole signature chain';

  static examples = ['$ immu check <jwt-collection-file>'];

  static args = [
    {
      name: 'jwtCollectionFile',
    },
  ];

  async run() {
    const { args } = this.parse(CheckJwtChain)
    const jwts = JSON.parse(readFileSync(args.jwtCollectionFile, 'utf-8'))

    const verifier = new Verifier(resolver);

    const verified = {
      patient: await verifier.verifyCredential(jwts.patient),
      provider: await verifier.verifyCredential(jwts.provider),
      site: await verifier.verifyCredential(jwts.site),
    }

    console.log(verified);
  }
}
