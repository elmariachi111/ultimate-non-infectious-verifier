import { Issuer } from '@immu/core';
import Web3 from 'web3';
import { resolver } from './verifier';

const web3 = new Web3(process.env.ETHEREUM_NODE!);
export const account = web3.eth.accounts.privateKeyToAccount(process.env.VERIFIER_ACCOUNT_PRIVATEKEY!);

export const verifierDid = `did:ethr:development:${account.address.toLowerCase()}`;

export const issuer = new Issuer(resolver, verifierDid);
