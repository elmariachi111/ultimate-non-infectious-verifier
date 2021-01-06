import React, { useContext } from 'react';
import { Account } from 'web3-core';
import { useWeb3 } from './Web3Context';

const PRIVATE_KEY = 'private-key';

interface IAccountContext {
  account: Account | null;
}

const IdentityContext = React.createContext<IAccountContext>({
  account: null
});

const useIdentity = () => useContext(IdentityContext);

const IdentityProvider = ({ children }: { children: React.ReactNode }) => {
  const { web3 } = useWeb3();

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

  return (
    <IdentityContext.Provider
      value={{
        account
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

export { IdentityProvider, useIdentity };
