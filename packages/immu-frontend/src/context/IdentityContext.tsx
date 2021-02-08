import React, { useContext } from 'react';
import { Account } from 'web3-core';
import Web3 from 'web3';
import { DID, Issuer, Resolver, Verifier } from '@immu/core';

const PRIVATE_KEY = 'private-key';

const ETH_NETWORKS: { [networkId: string]: string } = {
  '1': '',
  '3': 'ropsten',
  '4': 'rinkeby',
  '42': 'goerli',
  '1337': 'development'
};

interface IAccountContext {
  account: Account;
  resolver: Resolver;
  verifier: Verifier;
  issuer: Issuer,
  did: DID;
  chainId: string;
}

const web3 = new Web3();

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

const didByChainId = (account: Account, chainId?: string): DID => {
  const address = account.address.toLowerCase();
  return (chainId && Object.keys(ETH_NETWORKS).includes(chainId))
    ? `did:ethr:${ETH_NETWORKS[chainId]}:${address}`
    : `did:ethr:${address}`;
}

const resolver = new Resolver([
  ...Resolver.ethProviderConfig(process.env.REACT_APP_INFURA_ID!),
  {
    name: 'development',
    rpcUrl: process.env.REACT_APP_WEB3_RPC_URL!,
    registry: process.env.REACT_APP_REGISTRY!
  }
]);
const account = loadAccount() || createAccount();
const did = didByChainId(account);
const verifier = new Verifier(resolver);
const issuer = new Issuer(resolver, did);

const IdentityContext = React.createContext<IAccountContext>({
  account,
  resolver,
  verifier,
  issuer,
  did,
  chainId: '',
});

const useIdentity = () => useContext(IdentityContext);

const IdentityProvider = ({ children, chainId = '' }: { children: React.ReactNode, chainId?: string }) => {
  return (
    <IdentityContext.Provider
      value={{
        account,
        resolver,
        verifier,
        issuer,
        did: didByChainId(account, chainId),
        chainId
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export { IdentityProvider, useIdentity };
