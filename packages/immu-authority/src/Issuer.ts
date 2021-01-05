import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import DidRegistryContract from 'ethr-did-registry';
import { Resolver, DIDDocument } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

import { Issuer as DidIssuer, JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc';
import { SimpleSigner } from 'did-jwt';

export type EthereumAddress = string;
export type EthereumPrivateKey = string;

export class Issuer {
  private didResolver: Resolver;
  private web3: Web3;

  constructor(ethereumRpcUrl: string, registry: string) {
    this.web3 = new Web3(ethereumRpcUrl);
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

  async issueAuthority(
    privateKey: EthereumPrivateKey,
    issuer: EthereumAddress,
    subject: EthereumAddress
  ): Promise<string> {
    const didDoc = await this.getDid(issuer);
    const subjectDidDoc = await this.getDid(subject);

    const signer = SimpleSigner(privateKey);

    const didIssuer: DidIssuer = {
      did: didDoc.id,
      signer
    };

    const nbf = Math.floor(Date.now() / 1000);
    const vcPayload: JwtCredentialPayload = {
      sub: subjectDidDoc.id,
      nbf,
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
    const vcJwt = await createVerifiableCredentialJwt(vcPayload, didIssuer);
    return vcJwt;
  }
}
