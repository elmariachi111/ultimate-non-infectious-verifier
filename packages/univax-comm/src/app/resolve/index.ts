import { Resolver } from '@univax/core';
import { Router } from 'express';
import { RESOLVER_ENDPOINT } from '../../constants/endpoint';

export const router: Router = Router();

export const DB_FILENAME = './records.db';

const ethrDidConfig = [...Resolver.ethProviderConfig(process.env.INFURA_ID!)];
if (process.env.NODE_ENV === 'development') {
  ethrDidConfig.push({
    name: 'development',
    rpcUrl: process.env.ETHEREUM_NODE!,
    registry: process.env.REGISTRY!
  });
}

const resolver = new Resolver(ethrDidConfig);
if (process.env.SIDETREE) {
  resolver.initializeSidetreeResolver({
    eth: {
      node: process.env.ETHEREUM_NODE!,
      sideTreeContractAddress: process.env.SIDETREE!
    },
    ipfsNode: process.env.IPFS_API!,
    mongoConnection: process.env.MONGO_CONNECTION!,
    dbName: 'element-test'
  });
}

router.post(RESOLVER_ENDPOINT, async (req, res) => {
  const did = req.body.did;
  try {
    console.log(did);
    const didDoc = await resolver.resolve(did);
    res.status(200).json(didDoc);
  } catch (e) {
    console.error(e);
    res.status(404).json({ reason: e.message });
  }
});
