import React, { useContext, useEffect, useState } from 'react';
import { Account } from 'web3-core';
import { useWeb3 } from './Web3Context';
import { DIDDocument, Resolver, Verifier } from '@immu/core';

const PRIVATE_KEY = 'private-key';

interface IAccountContext {
  account?: Account | undefined;
  resolver?: Resolver | undefined;
  verifier?: Verifier | undefined;
  did?: DIDDocument | undefined;
}

const ETH_NETWORKS: { [networkId: string]: string } = {
  '1': '',
  '3': 'ropsten',
  '4': 'rinkeby',
  '42': 'goerli',
  '1337': 'development'
};
const IdentityContext = React.createContext<IAccountContext>({});

const useIdentity = () => useContext(IdentityContext);

const IdentityProvider = ({ children }: { children: React.ReactNode }) => {
  const { web3, chainId } = useWeb3();

  const [did, setDid] = useState<DIDDocument>();

  const loadAccount = (): Account | null => {
    const pk = localStorage.getItem(PRIVATE_KEY);
    return pk ? web3.eth.accounts.privateKeyToAccount(pk) : null;
  };

  const createAccount = (): Account => {
    // that's discouraged: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    const entropy = new TextDecoder('utf-8').decode(crypto.getRandomValues(new Uint8Array(32)));
    const account = web3.eth.accounts.create(entropy);
    localStorage.setItem(PRIVATE_KEY, account.privateKey);
    return account;
  };

  const account = loadAccount() || createAccount();

  const config = [
    ...Resolver.ethProviderConfig(process.env.REACT_APP_INFURA_ID!),
    {
      name: 'development',
      rpcUrl: process.env.REACT_APP_WEB3_RPC_URL!,
      registry: process.env.REACT_APP_REGISTRY!
    }
  ];

  const resolver = new Resolver(config);

  const verifier = new Verifier(resolver);

  useEffect(() => {
    (async () => {
      if (chainId) {
        const address = account.address.toLowerCase();

        const _did = Object.keys(ETH_NETWORKS).includes(chainId)
          ? `did:ethr:${ETH_NETWORKS[chainId]}:${address}`
          : `did:ethr:${address}`;

        setDid(await resolver.resolve(_did));
      }
    })();
  }, [chainId]);

  return (
    <IdentityContext.Provider
      value={{
        account,
        resolver,
        verifier,
        did
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export { IdentityProvider, useIdentity };
