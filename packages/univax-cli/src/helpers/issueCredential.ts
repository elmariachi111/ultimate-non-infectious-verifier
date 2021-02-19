import {CredentialPayload, Issuer} from '@univax/core';
import { chooseSigningKey, requestAndResolvePrivateKey } from './prompts';
import { writeFileSync } from 'fs';

interface IssueFlags {
  debug: boolean;
  proofType: string;
  privateKey?: string;
  out?: string;
}

export async function issueCredential(
  credential: CredentialPayload,
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
      },
      null,
      2
  } else {
    throw new Error(`proof type ${flags.proofType} is not supported`);
  }

  if (flags.out) {
    writeFileSync(flags.out, jsonVerifiableCredential, 'utf-8');
  } else {
    console.log(jsonVerifiableCredential);
  }
  return jsonVerifiableCredential;
}
