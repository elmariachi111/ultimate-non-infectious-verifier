import { Router } from 'express';
import { PUBLIC_ENDPOINT } from '../../constants/endpoint';
import * as crypto from 'crypto';
import bs58 from 'bs58';
import session from 'express-session';
import { Ed25519KeyPair, driver as didKeyDriver } from '@transmute/did-key-ed25519';


declare module 'express-session' {
  export interface SessionData {
    nonce: string;
    proven?: boolean;
    did?: string;
  }
}

// Export module for registering router in express app
export const router: Router = Router();
const html = String.raw;

// Define your routes here
router.get(PUBLIC_ENDPOINT + '/', (req, res) => {
  if (req.session.proven) {

    res.status(200).send(
      html`
        <div>
          <p>Nice to see you here, ${req.session.did}</p>
          <div>
          <form method="post" action="${PUBLIC_ENDPOINT}/authorize">
          <textarea placeholder="put a trusted verifiable page credential here"></textarea>
          <button type="submit">authorize!</button>
          </form>
        </div>
        </div>
      `
    )
  } else {
    res.render('index', {
      title: "foo",
      auth_url: `${PUBLIC_ENDPOINT}/authenticate`
    })
  }
});

router.get(PUBLIC_ENDPOINT + '/authenticate', (req, res) => {
  if (!req.session.nonce) {
    req.session.nonce = bs58.encode(crypto.randomBytes(32));
  }
  
  res.status(200).send(
    html`
    <div>
      <div>To prove control over your chosen DID, send us your DID &amp; a signature about this nonce: </div>
      <div><b>${req.session.nonce}</b></div>
      <div>
        <form method="post" action="${PUBLIC_ENDPOINT}/auth">
          <div>
            <input name="did" type="text" placeholder="your DID" />
          </div>
          <div>
            <textarea name="signature" placeholder="the base58 encoded signature"></textarea>
          </div>
          <div>
          <button type="submit">authenticate!</button>
          </div>
        </form>
      </div>
    </div>
    `
  )
});

async function prove(did: string, nonce: string, b58Signature: string) {
  const signature = bs58.decode(b58Signature);
  const didDocument = await didKeyDriver.get({ did });
  
  const verificationKey = Ed25519KeyPair.from(didDocument.verificationMethod[0]);
  const verifier = verificationKey.verifier();
  const result = await verifier.verify({ data: nonce, signature });
  return result;
}

router.post(PUBLIC_ENDPOINT + "/authenticate", async (req, res) => {
  if (!req.session.nonce) {
    throw("no nonce in your session")
  } else {
    const proven = await prove(req.body.did, req.session.nonce, req.body.signature);
    console.log(proven);
    if (proven) {
      req.session.proven = proven;
      req.session.did = req.body.did
    }
  }
  res.redirect(PUBLIC_ENDPOINT + "/");
})

router.post(PUBLIC_ENDPOINT + "/authorize", async(req, res) => {
  
})