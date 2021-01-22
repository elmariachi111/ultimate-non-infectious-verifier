import { EthereumPrivateKey } from '@immu/core/build/Resolver';
import cli from 'cli-ux';
import * as roles from '../../aliases.json';

export default async function requestAndResolvePrivateKey(givenPrivateKey?: string): Promise<EthereumPrivateKey> {

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
