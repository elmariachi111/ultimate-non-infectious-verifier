import { SidetreeElemMethod, Element } from "@univax/sidetree";

const { ETHEREUM_NODE, SIDETREE, IPFS_API, MONGO_CONNECTION} = process.env;

let sidetree: Promise<Element|null> = (async () => {
    if (SIDETREE && ETHEREUM_NODE && IPFS_API && MONGO_CONNECTION) {
        return await SidetreeElemMethod({
          eth: {
            node: ETHEREUM_NODE,
            sideTreeContractAddress: SIDETREE,
          },
          ipfsNode: IPFS_API,
          mongoConnection: MONGO_CONNECTION,
          dbName: process.env.MONGO_SIDETREE_ELEMENT_DBNAME || 'sidetree-elem-cache'
        });
    } else {
        return null;
    }
})();

export default sidetree;