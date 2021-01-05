#!/usr/bin/env node
import { config } from 'dotenv-flow';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import DidRegistryContract from 'ethr-did-registry';
import { Resolver, DIDDocument } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

import { Issuer, JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc';
import { SimpleSigner } from 'did-jwt';

config();

type EthereumAddress = string;
type EthereumPrivateKey = string;

const web3 = new Web3(process.env.ETHEREUM_NODE!);

const providerConfig = {
  networks: [
    {
      name: 'development',
      rpcUrl: process.env.ETHEREUM_NODE,
      registry: process.env.REGISTRY
    }
  ]
};
const ethrDidResolver = getResolver(providerConfig);
const didResolver = new Resolver(ethrDidResolver);

const identity = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const identity2 = '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0';

async function checkOwner() {
  const didReg = new web3.eth.Contract(DidRegistryContract.abi as AbiItem[], process.env.REGISTRY);
  const owner = await didReg.methods.identityOwner(identity2).call();
  console.log(owner);
}

async function getDid(identity: EthereumAddress): Promise<DIDDocument> {
  try {
    const doc = await didResolver.resolve(`did:ethr:development:${identity}`);
    console.debug(doc);
    return doc;
  } catch (e) {
    console.error(e.message);
    throw e;
  }
}

async function issueVc(issuer: EthereumAddress, privateKey: EthereumPrivateKey, subject: EthereumAddress) {
  const didDoc = await getDid(issuer);
  const subjectDidDoc = await getDid(subject);

  const signer = SimpleSigner(privateKey);

  const _issuer: Issuer = {
    did: didDoc.id,
    signer
  };

  const date = Math.floor(Date.now() / 1000);
  const vcPayload: JwtCredentialPayload = {
    sub: subjectDidDoc.id,
    nbf: date,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        authority: {
          type: 'ImmunizationAuthority',
          name: 'Berlin Treptow (Arena)',
          address: 'Am Treptower Hafen 1, 10999 Berlin'
        }
      }
    }
  };
  const vcJwt = await createVerifiableCredentialJwt(vcPayload, _issuer);
  console.log(vcJwt);
}

issueVc(identity, process.env.AUTHORITY_PRIVATE_KEY!, identity2);
