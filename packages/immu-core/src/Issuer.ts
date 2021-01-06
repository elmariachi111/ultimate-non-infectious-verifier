import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Account } from 'web3-core';

import DidRegistryContract from 'ethr-did-registry';
import { Resolver, DIDDocument } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

import { Issuer as DidIssuer, JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc';
import { SimpleSigner } from 'did-jwt';
import { JwtCredentialSubject } from 'did-jwt-vc/lib/types';

export type EthereumAddress = string;
export type EthereumPrivateKey = string;

export class Issuer {
  private didResolver: Resolver;
  private web3: Web3;
  private issuer: Account;

  constructor(ethereumRpcUrl: string, registry: string, privateKey: EthereumPrivateKey) {
    const providerConfig = {
      networks: [
        {
          name: 'development',
          rpcUrl: ethereumRpcUrl,
          registry
        }
      ]
    };
    const ethrDidResolver = getResolver(providerConfig);
    this.didResolver = new Resolver(ethrDidResolver);

    this.web3 = new Web3(ethereumRpcUrl);
    this.issuer = this.web3.eth.accounts.privateKeyToAccount(privateKey);
  }

  async checkOwner(ethAddress: EthereumAddress) {
    const didReg = new this.web3.eth.Contract(DidRegistryContract.abi as AbiItem[], process.env.REGISTRY);
    const owner = await didReg.methods.identityOwner(ethAddress).call();
    //console.log(owner);
  }

  async getDid(ethAddress: EthereumAddress): Promise<DIDDocument> {
    try {
      const doc = await this.didResolver.resolve(`did:ethr:development:${ethAddress}`);
      //console.debug(doc);
      return doc;
    } catch (e) {
      console.error(e.message);
      throw e;
    }
  }

  async issueClaim(subject: EthereumAddress, claim: JwtCredentialSubject): Promise<string> {
    const issuerDid = await this.getDid(this.issuer.address);
    const subjectDid = await this.getDid(subject);

    const nbf = Math.floor(Date.now() / 1000);
    const vcPayload: JwtCredentialPayload = {
      sub: subjectDid.id,
      nbf,
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: claim
      }
    };

    const didIssuer: DidIssuer = {
      did: issuerDid.id,
      signer: SimpleSigner(this.issuer.privateKey)
    };

    return createVerifiableCredentialJwt(vcPayload, didIssuer);
  }
}
