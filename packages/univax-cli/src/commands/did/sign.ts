import { Command, flags } from '@oclif/command';
import { Ed25519Signing, Secp256k1Signing, Jolocom } from '@univax/core';
import * as base58 from 'bs58';
import { chooseSigningKey, promptForPassword } from '../../helpers/prompts';
import { resolver } from '../../resolver';
import jolocom from '../../methods/jolocom'

export default class Sign extends Command {
  static description = 'signs <message>. Asks for private keys';

  static examples = ['$ univax did:sign <did> <message>'];

  static args = [
    { name: 'did', required: true },
    { name: 'message', required: true }
  ];

  async run() {
    const { args } = this.parse(Sign);
    
    const did = await resolver.resolve(args.did);

    if (!did.publicKey) {
      console.error('no authentication methods found in your did')
      return
    }
    let signature;

    if (Jolocom.isJolocomDid(args.did)) {
      const sdk = await jolocom;
      const passphrase = await promptForPassword();
      const agent = await sdk.loadAgent(passphrase, args.did);
      //const did = agent.idw.didDocument.toJSON();
      const content = Buffer.from(args.message, 'utf-8');
      signature = await agent.idw.sign(content, passphrase);
    } else {
      const { signingKey, signingPrivateKey } = await chooseSigningKey(did);

      let signer;
      if (signingKey.type == 'Secp256k1VerificationKey2018') {
        const s256keyPair = await (signingKey.ethereumAddress
          ? Secp256k1Signing.recoverKeyPairFromEthereumAccount(signingPrivateKey.slice(2))
          : Secp256k1Signing.recoverKeyPair(signingKey, signingPrivateKey))
        signer = s256keyPair.signer();
      } else if (signingKey.type == 'Ed25519VerificationKey2018') {
        const edKeyPair = await Ed25519Signing.recoverEd25519KeyPair(signingKey, signingPrivateKey);
        signer = await edKeyPair.signer();
      } else {
        throw new Error(`unsupported key type ${signingKey.type}`)
      }
  
      signature = await signer.sign({
        data: args.message
      });
    }

    console.log({
      did: did.id,
      message: args.message,
      signature: base58.encode(signature)
    });
    this.exit();
  }
}
