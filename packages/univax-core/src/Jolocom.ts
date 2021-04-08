// import { JolocomLib, SoftwareKeyProvider } from 'jolocom-lib';
// import { walletUtils, cryptoUtils, getIcp } from '@jolocom/native-core';
// import { KeyTypes, getCryptoProvider } from '@jolocom/vaulted-key-provider';
// //import { IdentityWallet } from 'jolocom-lib/js/identityWallet/identityWallet';
// import { Identity } from 'jolocom-lib/js/identity/identity';
// import { getRegistrar } from '@jolocom/local-resolver-registrar';
import { JolocomSDK } from '@jolocom/sdk';
import fetch from 'cross-fetch';
import { entityList, JolocomTypeormStorage, EncryptedWalletEntity } from '@jolocom/sdk-storage-typeorm';
import { Connection, createConnection } from 'typeorm';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions';
import { Fetch } from '@jolocom/sdk/js/http';
import { JolocomLib } from 'jolocom-lib';
import { Identity } from 'jolocom-lib/js/identity/identity';
import {} from '@jolocom/protocol-ts';
export { JolocomSDK } from '@jolocom/sdk';

let sdk: JolocomSDK;
let _connection: Connection;

export async function connection(dbName = 'jolocom'): Promise<Connection> {
  if (_connection) return _connection;

  const ormConfig: SqljsConnectionOptions = {
    type: 'sqljs',
    autoSave: true,
    location: dbName,
    logging: ['error', 'warn', 'schema'],
    synchronize: true,
    entities: [...entityList]
  };
  _connection = await createConnection(ormConfig);
  return _connection;
}

export async function initSdk(dbName = 'jolocom'): Promise<JolocomSDK> {
  const typeormConnection = await connection(dbName);
  const storage = new JolocomTypeormStorage(typeormConnection);
  sdk = new JolocomSDK({ storage });
  sdk.transports.http.configure({ fetch: (fetch as unknown) as Fetch });

  return sdk;
}

export async function listIdenitites(): Promise<EncryptedWalletEntity[]> {
  const conn = await connection();
  return conn.manager.find(EncryptedWalletEntity);
}

export async function validate(credential: any, identity: Identity) {
  const res = await JolocomLib.parseAndValidate.signedCredential(credential, identity);
  const valid = await JolocomLib.util.validateDigestable(res, identity);
  console.log('foo', res.toJSON());
  console.log('valid', valid);
}

export function isJolocomDid(did: string) {
  return did.startsWith('did:jun') || did.startsWith('did:jolo');
}
