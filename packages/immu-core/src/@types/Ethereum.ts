import { provider } from 'web3-core';

export type EthereumAddress = string;
export type EthereumPrivateKey = string;

export interface EthProviderConfig {
  name: string;
  rpcUrl?: string;
  registry?: EthereumAddress;
  provider?: provider;
}
