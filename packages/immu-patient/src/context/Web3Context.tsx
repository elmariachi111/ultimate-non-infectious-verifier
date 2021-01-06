import React, { useContext, useState } from 'react';
import Web3 from 'web3';

interface IWeb3Context {
  web3: Web3;
}

console.log(process.env.REACT_APP_WEB3_RPC_URL);
const _web3 = new Web3(process.env.REACT_APP_WEB3_RPC_URL!);

const Web3Context = React.createContext<IWeb3Context>({
  web3: _web3
});

const useWeb3 = () => useContext(Web3Context);

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [web3] = useState<Web3>(_web3);

  return (
    <Web3Context.Provider
      value={{
        web3
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export { Web3Provider, useWeb3 };
