import { JolocomLib, SoftwareKeyProvider } from 'jolocom-lib';
import { walletUtils, cryptoUtils, getIcp } from '@jolocom/native-core';
import { KeyTypes, getCryptoProvider } from '@jolocom/vaulted-key-provider';
//import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';
import { Identity } from 'jolocom-lib/js/identity/identity';
import { getRegistrar } from '@jolocom/local-resolver-registrar';
import typeorm from 'typeorm'


const ormConfig = {
    type: 'sqlite',
    database: './db.sqlite3',
    logging: ['error', 'warn', 'schema'],
    entities: [ 'node_modules/@jolocom/sdk-storage-typeorm/js/src/entities/*.js' ],
    /** or if you list entity classes, then simply add the SDK entities
    entities: [
      // your entities here
      // then
      ...require('@jolocom/sdk-storage-typeorm').entityList
    ],
    */
  
    // migrations are recommended!
    migrations: ['./migrations/*.ts'],
    migrationsRun: true,
    synchronize: false,
    cli: {
      migrationsDir: './migrations',
    },
  }

//const crypto = getCryptoProvider(cryptoUtils);

//const registry = JolocomLib registries.jolocom.create()

// export async function createNewIdentity(secret = 'secret', seed?: Uint8Array): Promise<Identity> {
//   if (!seed) {
//     seed = await crypto.getRandom(32);
//   }

//   const id = 'my_id';
//   const wallet = await SoftwareKeyProvider.newEmptyWallet(walletUtils, id, secret);

//   const newSigningKey = await wallet.newKeyPair(secret, KeyTypes.ecdsaSecp256k1VerificationKey2019, `signing-key-1`);

//   getRegistrar({})
//   const identity = await JolocomLib.didMethods.jun.registrar.create(wallet, secret);

//   return identity;

//   //  await this.sdk.storeIdentityData(this._identityWallet.identity, this._keyProvider);
//   //this._didMethod = this.didMethod;
// }

export function init() {
    const typeormConnection = await typeorm.createConnection(typeormConfig)
    const storage = new JolocomTypeormStorage(typeormConnection)
  
    console.log('about to create SDK instance')
    const sdk = new JolocomSDK({ storage })
  
    // Running sdk.init() with no arguments will:
    // - create an identity if it doesn't exist
    // - load the identity from storage
    const identityWallet = await sdk.init()
    console.log('Agent identity', identityWallet.identity)
}
export funciton createAgent() {

}