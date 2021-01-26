import { DIDDocument, PublicKey } from '@immu/core';
import { EthereumPrivateKey } from '@immu/core/build/Resolver';
import cli from 'cli-ux';
import * as inquirer from 'inquirer';
import * as roles from '../../aliases.json';

export async function requestAndResolvePrivateKey(givenPrivateKey?: string): Promise<EthereumPrivateKey> {

    let privateKey: string = givenPrivateKey || await cli.prompt('Enter your private key', {
        type: 'hide'
    });

    if (privateKey.startsWith('0x')) {
        return privateKey;
    } else {
        //@ts-ignore
        return roles[privateKey]['privateKey'];
    }
}

export async function chooseDidFromRoles(givenDid?: string): Promise<string>  {
    if (givenDid) return givenDid;
    
    const choices = Object.keys(roles).map( (role: string) => ({
        name: `${role} ${roles[role].did}`,
        value: roles[role].did
    }));
    const prompt = inquirer.createPromptModule();
    const {did} = await prompt([{
      type: "list",
      name: "did",
      message: "choose a DID from your local wallet",
      choices: choices
    }]);
    return did;
}

export async function chooseSigningKey(issuerDid: DIDDocument): Promise<{ signingKey: PublicKey, signingPrivateKey: string }> {
    const prompt = inquirer.createPromptModule();
    const { signingKey: signingKeyChoice } = await prompt([{
        type: "list",
        name: "signingKey",
        message: "signing key to use",
        choices: issuerDid.publicKey.map(publicKey => ({ name: `${publicKey.id}(${publicKey.type}) `, value: publicKey.id }))
    }]);
    const [signingKey] = issuerDid.publicKey.filter(pk => pk.id == signingKeyChoice);

    const { signingPrivateKey } = await prompt([{
        message: `private key for ${signingKey.id}`,
        name: "signingPrivateKey",
        type: "hide"
    }])

    return {
        signingKey, signingPrivateKey
    }
}