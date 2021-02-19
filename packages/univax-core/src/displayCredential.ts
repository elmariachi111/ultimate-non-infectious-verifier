import { Verifiable, W3CCredential } from 'did-jwt-vc';

export function displayCredential(credential: Verifiable<W3CCredential>): string {
  const issuanceDate = new Date(credential.issuanceDate);

  let ret = `At ${issuanceDate.toLocaleString()}\nthe issuer ${
    credential.issuer.id || credential.issuer
  } has claimed \n`;
  const subject = credential.credentialSubject;
  if (subject.id) {
    ret += `about the subject ${subject.id} that: \n`;
  }
  ret += JSON.stringify(subject, null, 2) + `\n`;
  ret += `using a proof of type ${credential.proof.type}, looking like: \n`;
  ret += JSON.stringify(credential.proof, null, 2) + `\n`;

  return ret;
}
