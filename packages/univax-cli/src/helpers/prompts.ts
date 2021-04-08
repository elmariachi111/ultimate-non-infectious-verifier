import { DIDDocument, PublicKey, Ed25519Signing, Jolocom } from '@univax/core';
import cli from 'cli-ux';
import * as inquirer from 'inquirer';
import * as roles from '../../aliases.json';

export async function requestAndResolvePrivateKey(givenPrivateKey?: string): Promise<string> {
  const privateKey: string = givenPrivateKey || await cli.prompt('Enter your private key', {
    type: 'hide',
  })
  if (Object.keys(roles).includes(privateKey))
    // @ts-ignore
    return roles[privateKey].privateKey;

  return privateKey
}

export async function chooseDidFromRoles(givenDid?: string): Promise<string> {
  if (givenDid) {
    if (givenDid.startsWith('did:')) return givenDid;
    if (Object.keys(roles).includes(givenDid)) {
      return roles[givenDid].did;
    }
    throw new Error(`${givenDid} unknown`);
  } else {
    const choices = Object.keys(roles).map((role: string) => ({
      name: `${role} ${roles[role].did}`,
      value: roles[role].did
    }));
    const prompt = inquirer.createPromptModule()
    const { did } = await prompt([{
      type: 'list',
      name: 'did',
      message: 'choose a DID from your local wallet',
      choices: choices
    }])
    return did
  }
}

export async function chooseDidFromJolocomSdk(): Promise<string> {
  const wallets = await Jolocom.listIdenitites();
  const choices = wallets.map((wallet: any) => ({
    name: wallet.id,
    value: wallet.id
  }));
  const prompt = inquirer.createPromptModule()
  const { did } = await prompt([{
    type: 'list',
    name: 'did',
    message: 'choose a DID from your local wallet',
    choices: choices
  }])
  return did
}

export async function promptForPassword(): Promise<string> {
  const {secret} = await inquirer.prompt([{
    type: 'password',
    name: 'secret',
  }])
  return secret;

}
export async function chooseSigningKey(
  issuerDid: DIDDocument,
): Promise<{ signingKey: PublicKey; signingPrivateKey: string }> {
  const prompt = inquirer.createPromptModule();
  const { signingKey: signingKeyChoice } = await prompt([{
    type: 'list',
    name: 'signingKey',
    message: 'signing key to use',
    choices: issuerDid.publicKey.map((publicKey) => ({
      name: `${publicKey.id}(${publicKey.type}) `,
      value: publicKey.id
    }))
  },
  ]);
  
  const signingKey: PublicKey | undefined = issuerDid.publicKey.find(pk => pk.id == signingKeyChoice)
  if (signingKey === undefined) throw Error("this cannot happen");

  let { signingPrivateKey } = await prompt([{
    message: `private key for ${signingKey.id}`,
    name: 'signingPrivateKey',
    type: 'password',
  },
  ])

  if (signingKey.publicKeyJwk) {
    signingPrivateKey = Ed25519Signing.privateKeyJwkFromPrivateKeyBase58(signingPrivateKey);
  }

  return {
    signingKey,
    signingPrivateKey
  };
}
