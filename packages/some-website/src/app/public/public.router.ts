import { driver as didKeyDriver, Ed25519KeyPair } from '@transmute/did-key-ed25519';
import bs58 from 'bs58';
import * as crypto from 'crypto';
import { Router } from 'express';
import { PUBLIC_ENDPOINT } from '../../constants/endpoint';
import { verifier } from '../services/verifier';
import { JSONCredential } from '@immu/core';

// Export module for registering router in express app
export const router: Router = Router();

// Define your routes here
router.get(PUBLIC_ENDPOINT + '/', async (req, res) => {
  if (req.session.did) {
    res.render(`public/authenticated.twig`, {
      did: req.session.did,
      authorize_url: `${PUBLIC_ENDPOINT}/authorize`,
      roles: req.session.roles || []
    });
  } else {
    if (!req.session.nonce) {
      req.session.nonce = bs58.encode(crypto.randomBytes(32));
    }

    res.render('public/authenticate.twig', {
      nonce: req.session.nonce,
      auth_url: `${PUBLIC_ENDPOINT}/authenticate`
    });
  }
});

router.post(PUBLIC_ENDPOINT + '/authenticate', async (req, res) => {
  if (!req.session.nonce) {
    throw 'no nonce in your session';
  } else {
    const proveResult = await prove(req.body.did, req.session.nonce, req.body.signature);
    if (proveResult) {
      req.session.did = req.body.did;
    }
  }
  res.redirect(PUBLIC_ENDPOINT + '/');
});

router.post(PUBLIC_ENDPOINT + '/authorize', async (req, res, next) => {
  const credential: JSONCredential = JSON.parse(req.body.vc);
  try {
    const credentialVerified = await verifier.verifyJsonCredential(credential);
    if (credentialVerified) {
      if (credential.credentialSubject.id !== req.session.did)
        throw new Error(`the credential subject (${credential.credentialSubject.id}) is not you ${req.session.did}`);

      if (!credential.credentialSubject['roles']) {
        throw new Error(`the credential subject is not about roles.`);
      }

      req.session.roles = credential.credentialSubject['roles'];
      res.redirect(PUBLIC_ENDPOINT + '/');
    }
  } catch (e) {
    return next(e);
  }
});

router.get(PUBLIC_ENDPOINT + '/logout', async (req, res, next) => {
  req.session.destroy(function (err) {
    res.redirect(PUBLIC_ENDPOINT + '/');
  });
});

async function prove(did: string, nonce: string, b58Signature: string) {
  const signature = bs58.decode(b58Signature);
  const didDocument = await didKeyDriver.get({ did });

  const verificationKey = Ed25519KeyPair.from(didDocument.verificationMethod[0]);
  const verifier = verificationKey.verifier();
  const result = await verifier.verify({ data: nonce, signature });
  return result;
}
