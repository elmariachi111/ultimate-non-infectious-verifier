import { DID, Issuer, W3CCredential } from '@univax/core';
import { writeFileSync } from 'fs';
import jolocom from '../methods/jolocom';
import { chooseSigningKey, promptForPassword, requestAndResolvePrivateKey } from './prompts';

interface IssueFlags {
  debug: boolean;
  proofType: string;
  privateKey?: string;
  out?: string;
}

export async function issueCredential(
  credential: W3CCredential,
  issuer: Issuer,
  flags: IssueFlags,
): Promise<string> {
  if (flags.debug) console.debug(JSON.stringify(credential, null, 2));

  let jsonVerifiableCredential

  if (flags.proofType == 'jwt') {
    const privateKey = await requestAndResolvePrivateKey(flags.privateKey);
    jsonVerifiableCredential = await issuer.createJwt(credential, privateKey)
  } else if (flags.proofType == 'jws') {
    const { signingKey, signingPrivateKey } = await chooseSigningKey(await issuer.resolveIssuerDid());
    jsonVerifiableCredential = JSON.stringify({
      ...credential,
      proof: await issuer.createJsonProof(credential, signingKey, signingPrivateKey)
    }, null, 2);
  } else {
    throw new Error(`proof type ${flags.proofType} is not supported`);
  }
  
  return jsonVerifiableCredential;
}

export async function joloIssueCredential(
  credential: W3CCredential,
  issuer: DID,
  credentialName: string,
): Promise<string> {
  const sdk = await jolocom;
  const passphrase = await promptForPassword();
  const agent = await sdk.loadAgent(passphrase, issuer);
  const fieldNames = Object.keys(credential.credentialSubject).filter(k => k != 'id');

  const metadata = {
    fieldNames,
    optionalFieldNames: [],
    type: credential.type,
    name: credentialName,
    claimInterface: {
      provider: {
        type: "",
        name: "",
      }
    },
    context: [
//        "https://w3id.org/identity/v1",
//       // "https://identity.jolocom.com/terms",
//        "https://w3id.org/security/v1",
//        "https://w3id.org/credentials/v1",
// //       "https://schema.org",
      {
      ProofOfProvider: "https://example.com/terms/ProofOfProviderCredential", 
      schema: "http://schema.org/",
      provider: {
        "@id": "schema:person",
        "@type": "@id"
      }
    }]
  }

  let claim: Record<string, any> = {};
  fieldNames.forEach(f => claim[f] = credential.credentialSubject[f]);
  
  const signedCredential = await agent.signedCredential({
    metadata,
    subject: credential.credentialSubject.id || issuer,
    claim: {
      provider: {
        type: "ImmunizationProvider",
        name: "John Doe",
      }
    }
  })
  const jsonVerifiableCredential = JSON.stringify(signedCredential.toJSON(), null, 2);

  return jsonVerifiableCredential;
}