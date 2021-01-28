import contract from '@truffle/contract';
import DidRegistryContract from 'ethr-did-registry';
import Web3 from 'web3';

/**
 * @return a freshly deployed ethr did contract instance
 * @param web3
 */
export default async function makeRegistry(web3: Web3): Promise<any> {
    const DidReg = contract(DidRegistryContract);
    DidReg.setProvider(web3.currentProvider);

    const accounts = await web3.eth.getAccounts();
    const registry = await DidReg.new({
        from: accounts[9],
        gasPrice: 100000000000,
        gas: 4712388 // 1779962
    });
    return registry;
}
