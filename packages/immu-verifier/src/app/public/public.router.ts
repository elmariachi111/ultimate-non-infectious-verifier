import { driver as didKeyDriver, Ed25519KeyPair } from '@transmute/did-key-ed25519';
import bs58 from 'bs58';
import * as crypto from 'crypto';
import { Router } from 'express';
import { PUBLIC_ENDPOINT } from '../../constants/endpoint';
import { isIssuerTrusted, trustedIssuers, verifier } from '../services/verifier';
import { JSONCredential, createRequest } from '@immu/core';
import { account, verifierDid, issuer } from '../services/verifierAccount';
//@ts-ignore
import QRCode from 'qrcode';

export const router: Router = Router();

router.get(PUBLIC_ENDPOINT + '/', async (req, res) => {
  if (req.session.did) {
    res.render(`public/authenticated.twig`, {
      authorize_url: `${PUBLIC_ENDPOINT}/authorize`,
      trusted_issuers: trustedIssuers
    });
  } else {
    if (!req.session.nonce) {
      req.session.nonce = bs58.encode(crypto.randomBytes(32));
    }

    const verificationRequest = createRequest({
      requester: verifierDid,
      requestedSubjects: ['ProofOfImmunization'],
      challenge: req.session.nonce,
      callbackUrl: `${process.env.SERVER_HOST}/${PUBLIC_ENDPOINT}present`
    });

    const presentationRequestJwt = await issuer.createAnyJwt(verificationRequest, account.privateKey);
    console.log(presentationRequestJwt);

    const qrCode = await QRCode.toDataURL(presentationRequestJwt);

    res.render('public/authenticate.twig', {
      presentation_jwt: presentationRequestJwt,
      qr_code: qrCode
    });
  }
});

router.post(PUBLIC_ENDPOINT + '/authenticate', async (req, res) => {
  if (!req.session.nonce) {
    throw 'no nonce in your session';
  } else {
    const proveResult = await prove(req.body.did, req.session.nonce, req.body.signature);
    console.log(`${req.body.did} signed ${req.session.nonce} correctly`);
    if (proveResult) {
      req.session.did = req.body.did;
    }
  }
  return res.redirect(PUBLIC_ENDPOINT + '/');
});

router.post(PUBLIC_ENDPOINT + '/authorize', async (req, res, next) => {
  const credential: JSONCredential = JSON.parse(req.body.vc);
  try {
    const credentialVerified = await verifier.verifyJsonCredential(credential);
    if (credentialVerified) {
      if (credential.credentialSubject.id !== req.session.did)
        throw new Error(`the credential subject (${credential.credentialSubject.id}) is not you ${req.session.did}`);

      if (!credential.credentialSubject['roles']) {
        throw new Error(`the credential subject doesn't deal with roles.`);
      }

      if (!isIssuerTrusted(credential.issuer)) {
        throw new Error(`the credential looks good but ${credential.issuer} is not on the trust list.`);
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

//todo: this is supposed to work with sec256k keys, too
//might be solved by using specialized authorization credentials
async function prove(did: string, nonce: string, b58Signature: string) {
  const signature = bs58.decode(b58Signature);
  const didDocument = await didKeyDriver.get({ did });

  const verificationKey = Ed25519KeyPair.from(didDocument.verificationMethod[0]);
  const verifier = verificationKey.verifier();
  const result = await verifier.verify({ data: nonce, signature });
  return result;
}
