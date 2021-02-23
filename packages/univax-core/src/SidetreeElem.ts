import { Element } from '@sidetree/element';
import { ICas, Config } from '@sidetree/common';
import { OperationGenerator, Jwk, CreateOperation } from '@sidetree/core';

import { EthereumLedger } from '@sidetree/ethereum';
import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import Web3 from 'web3_130';

export interface SidetreeElemEnvironment {
  eth: {
    node: string;
    sideTreeContractAddress: string;
  };
  ipfsNode: string;
  mongoConnection: string;
  dbName?: string;
}

export async function SidetreeElem(sideTreeElemEnvironment: SidetreeElemEnvironment): Promise<Element> {
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

export function GetResolver(didMethod: Element): any {
  return {
    elem: async (did: string, parsed: any) => {
      await didMethod.triggerBatchAndObserve();
      const responseModel = await didMethod.handleResolveRequest(did);
      return responseModel.body;
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
        signingPrivateKey
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
