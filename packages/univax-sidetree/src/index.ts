import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import { Config, ICas } from '@sidetree/common';
import { CreateOperation, Jwk, OperationGenerator } from '@sidetree/core';
import { Element } from '@sidetree/element';
import { EthereumLedger } from '@sidetree/ethereum';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
import { DIDResolver } from 'did-resolver';
import Web3 from 'web3';
export { Element } from '@sidetree/element';

interface DIDResolverRegistry {
  [index: string]: DIDResolver;
}

export interface SidetreeElemEnvironment {
  eth: {
    node: string;
    sideTreeContractAddress: string;
  };
  ipfsNode: string;
  mongoConnection: string;
  dbName?: string;
}

/**
 * initializes a new sidetree elem "API"
 * @param sideTreeElemEnvironment
 */
export async function SidetreeElemMethod(sideTreeElemEnvironment: SidetreeElemEnvironment): Promise<Element> {
  const web3 = new Web3(sideTreeElemEnvironment.eth.node);
  const ledger = new EthereumLedger(web3, sideTreeElemEnvironment.eth.sideTreeContractAddress);

  const config: Config = {
    contentAddressableStoreServiceUri: sideTreeElemEnvironment.ipfsNode,
    didMethodName: 'elem',
    databaseName: sideTreeElemEnvironment.dbName || 'element-cache',
    mongoDbConnectionString: sideTreeElemEnvironment.mongoConnection,
    batchingIntervalInSeconds: 5,
    observingIntervalInSeconds: 5,
    maxConcurrentDownloads: 20
  };

  const cas: ICas = new IpfsCasWithCache(
    sideTreeElemEnvironment.ipfsNode,
    config.mongoDbConnectionString,
    config.databaseName
  );

  const element = new Element(
    config,
    [
      {
        startingBlockchainTime: 0,
        version: 'latest'
      }
    ],
    ledger,
    cas
  );

  await element.initialize(false, false);
  return element;
}

export function GetResolver(elemMethod: Element): DIDResolverRegistry {
  return {
    elem: async (did: string, parsed: any) => {
      await elemMethod.triggerBatchAndObserve();
      const responseModel = await elemMethod.handleResolveRequest(did);
      return responseModel.body.didDocument;
    }
  };
}

async function CreateDidOperation(): Promise<any> {
  const signingKeyId = 'signingKey';
  const [recoveryPublicKey, recoveryPrivateKey] = await Jwk.generateEd25519KeyPair();
  const [updatePublicKey, updatePrivateKey] = await Jwk.generateEd25519KeyPair();
  const [signingPublicKey, signingPrivateKey] = await OperationGenerator.generateKeyPair(signingKeyId);

  const createOperationRequest = await OperationGenerator.generateCreateOperationRequest(
    recoveryPublicKey,
    updatePublicKey,
    [signingPublicKey]
  );

  const operationBuffer = Buffer.from(JSON.stringify(createOperationRequest));
  const createOperation = await CreateOperation.parse(operationBuffer);

  const didMethodName = 'elem';
  const didUniqueSuffix = createOperation.didUniqueSuffix;
  const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
  const encodedSuffixData = createOperation.encodedSuffixData;
  const encodedDelta = createOperation.encodedDelta;
  const longFormDid = `${shortFormDid}?-sidetree-initial-state=${encodedSuffixData}.${encodedDelta}`;

  const { publicKeyBase58, privateKeyBase58 } = Ed25519KeyPair.from({
    id: signingPublicKey.id,
    type: signingPublicKey.type,
    controller: shortFormDid,
    publicKeyJwk: signingPublicKey.jwk,
    privateKeyJwk: signingPrivateKey
  }).toKeyPair(true);

  return {
    shortFormDid,
    longFormDid,
    createOperationRequest,
    createOperation,
    keys: {
      recovery: {
        recoveryPublicKey,
        recoveryPrivateKey
      },
      update: {
        updatePublicKey,
        updatePrivateKey
      },
      signing: {
        signingPublicKey,
        signingPrivateKey,
        signingPublicKeyBase58: publicKeyBase58,
        signingPrivateKeyBase58: privateKeyBase58
      }
    }
  };
}

export async function CreateSidetreeElemDid(didMethod: Element) {
  const didOperation = await CreateDidOperation();

  const responseModel = await didMethod.handleOperationRequest(
    Buffer.from(JSON.stringify(didOperation.createOperationRequest))
  );
  await didMethod.triggerBatchAndObserve();
  console.debug('anchoring result:', responseModel);

  return {
    shortFormDid: didOperation.shortFormDid,
    longFormDid: didOperation.longFormDid,
    keys: didOperation.keys
  };
}
