import { SidetreeElemMethod, GetResolver as GetSidetreeElementResolver } from '@univax/sidetree';
import { ResolverBuilder, EthProviderConfig } from '@univax/core';

import { Router } from 'express';
import { RESOLVER_ENDPOINT } from '../../constants/endpoint';
const {
  NODE_ENV,
  ETHEREUM_NODE,
  SIDETREE,
  REGISTRY,
  IPFS_API,
  MONGO_CONNECTION,
  MONGO_SIDETREE_ELEMENT_DBNAME,
  INFURA_ID
} = process.env;

let ethNetworks: EthProviderConfig[] = [];

if (INFURA_ID) {
  ethNetworks = [...ethNetworks, ...ResolverBuilder.ethProviderConfig(INFURA_ID)];
}

if (NODE_ENV == 'development') {
  ethNetworks = [
    ...ethNetworks,
    {
      name: 'development',
      rpcUrl: ETHEREUM_NODE,
      registry: REGISTRY
    }
  ];
}

const builder = ResolverBuilder().addKeyResolver().addEthResolver(ethNetworks);

if (SIDETREE && ETHEREUM_NODE && IPFS_API && MONGO_CONNECTION) {
  const sideTreeRegistry = async () => {
    const _sidetree = await SidetreeElemMethod({
      eth: {
        node: ETHEREUM_NODE,
        sideTreeContractAddress: SIDETREE
      },
      ipfsNode: IPFS_API,
      mongoConnection: MONGO_CONNECTION,
      dbName: MONGO_SIDETREE_ELEMENT_DBNAME || 'sidetree-elem-cache'
    });
    if (!_sidetree) throw Error('sidetree not constructed');
    return GetSidetreeElementResolver(_sidetree);
  };

  builder.addCustomResolver(sideTreeRegistry());
}

const resolver = builder.build();

export const router: Router = Router();

router.post(RESOLVER_ENDPOINT, async (req, res) => {
  const did = req.body.did;
  try {
    const didDoc = await resolver.resolve(did);
    res.status(200).json(didDoc);
  } catch (e) {
    console.error(e);
    res.status(404).json({ reason: e.message });
  }
});
