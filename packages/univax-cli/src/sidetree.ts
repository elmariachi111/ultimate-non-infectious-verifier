import { Sidetree } from "@univax/core";

const { ETHEREUM_NODE, SIDETREE, IPFS_API, MONGO_CONNECTION} = process.env;

let sidetree: Promise<Sidetree.Element|null> = (async () => {
    if (SIDETREE && ETHEREUM_NODE && IPFS_API && MONGO_CONNECTION) {
        return await Sidetree.SidetreeElemMethod({
          eth: {
            node: ETHEREUM_NODE,
            sideTreeContractAddress: SIDETREE,
          },
          ipfsNode: IPFS_API,
          mongoConnection: MONGO_CONNECTION,
          dbName: 'element-test'
        });
    } else {
        return null;
    }
})();

export default sidetree;