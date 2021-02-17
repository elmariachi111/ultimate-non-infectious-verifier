import React, { useContext } from 'react';
import { Account } from 'web3-core';
import Web3 from 'web3';
import { DID, EthRegistry, Issuer, Resolver, Verifier } from '@immu/core';
//import { useWeb3React } from '@web3-react/core';

const PRIVATE_KEY = 'private-key';

const ETH_NETWORKS: { [network: string]: string } = {
  'mainnet':'1',
  'rinkeby': '4',
  'goerli': '42',
  'development': '1337'
};

interface IAccountContext {
  account: Account;
  resolver: Resolver;
  registry: EthRegistry;
  verifier: Verifier;
  issuer: Issuer,
  did: DID;
  web3: Web3;
  chainId: string;
}

const resolverConfig = Resolver.ethProviderConfig(process.env.REACT_APP_INFURA_ID!);
if (process.env.REACT_APP_WEB3_RPC_URL) {
  resolverConfig.push({
    name: 'development',
    rpcUrl: process.env.REACT_APP_WEB3_RPC_URL!,
    registry: process.env.REACT_APP_REGISTRY!
  })
}

const loadAccount = (web3: Web3): Account | null => {
  const pk = localStorage.getItem(PRIVATE_KEY);
  return pk ? web3.eth.accounts.privateKeyToAccount(pk) : null;
};

const createAccount = (web3: Web3): Account => {
  // that's discouraged: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
  const entropy = new TextDecoder('utf-8').decode(crypto.getRandomValues(new Uint8Array(32)));
  const account = web3.eth.accounts.create(entropy);
  localStorage.setItem(PRIVATE_KEY, account.privateKey);
  return account;
};

const didByChainId = (account: Account, chainId: string): DID => {
  const address = account.address.toLowerCase();
  return ((chainId === 'mainnet') || (!Object.keys(ETH_NETWORKS).includes(chainId)))
  ? `did:ethr:${address}`
  : `did:ethr:${chainId}:${address}`;
}

const makeContext = (web3: Web3, chainId: string): IAccountContext  => {
  
  const resolver = new Resolver(resolverConfig);
  const registry = new EthRegistry(resolverConfig);
  const account = loadAccount(web3) || createAccount(web3);
  const did = didByChainId(account, chainId);
  const verifier = new Verifier(resolver);
  const issuer = new Issuer(resolver, did);

  return {
    account,
    resolver,
    registry,
    verifier,
    issuer,
    did,
    web3,
    chainId,
  }
 
}

const defaultContext = makeContext(new Web3(), 'development');

const IdentityContext = React.createContext<IAccountContext>(defaultContext);

const useIdentity = () => useContext(IdentityContext);

const IdentityProvider = ({ children, chainId = 'development', web3 }: {
   children: React.ReactNode, chainId?: string, web3?: Web3 
  }) => {
    if (!chainId) {
      chainId = 'development';
    }
  //const { activate } = useWeb3React();

  //const registry = new EthRegistry(resolverConfig, web3);
  const context = makeContext(web3 || new Web3(), chainId);
  return (
    <IdentityContext.Provider
      value={context}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export { IdentityProvider, useIdentity };
