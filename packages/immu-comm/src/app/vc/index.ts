import { Router } from 'express';
import { VC_ENDPOINT } from '../../constants/endpoint';
import { Verifiable, W3CCredential } from '@immu/core';
import levelup, { LevelUp } from 'levelup';
import leveldown from 'leveldown';
import encodingDown from 'encoding-down';

export const router: Router = Router();

export const DB_FILENAME = './records.db';

interface CredentialStore {
  [did: string]: {
    [vctype: string]: Verifiable<W3CCredential>[];
  };
}

const credStore: LevelUp = levelup(
  encodingDown(leveldown(process.env.DB_FILENAME || 'cred.db'), {
    keyEncoding: 'string',
    valueEncoding: 'json'
  })
);

export default credStore;

//todo: poster (verifier) must sign a self chosen nonce and present a bearer jwt to be allowed to do this.
router.get(VC_ENDPOINT + '/:did', async (req, res) => {
  const type = req.query.vctype as string;
  const did = req.params.did;
  const key = `[${did}][${type}]`;
  try {
    const credentials = await credStore.get(key);
    res.status(200).json(credentials);
  } catch (e) {
    console.error(e);
    res.status(404).json({ reason: 'not found' });
  }
});

//todo: poster must be issuer or holder and
// sign a self chosen nonce and present a bearer jwt to be allowed to do this.
router.post(VC_ENDPOINT, async (req, res) => {
  const credential = req.body as Verifiable<W3CCredential>;

  if (!credential.credentialSubject.id) throw Error('we only support credentials with unique subjects');

  const did: string = credential.credentialSubject.id;
  const types: string[] = credential.type;

  const type = types.find((t) => t != 'VerifiableCredential');

  const key = `[${did}][${type}]`;

  let credentials;
  try {
    credentials = await credStore.get(key);
  } catch (e) {
    credentials = [];
  }

  credentials.push(credential);
  await credStore.put(key, credentials);

  res.status(200).send({ msg: 'ok' });
});
