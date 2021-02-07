import React, { useContext, createContext, useEffect } from 'react';
import { CredentialPayload } from '@immu/core';

import { useState } from 'react';

export interface CredentialState {
  credentials: {
    [type: string]: CredentialPayload[];
  };
  addCredential: (credential: CredentialPayload) => void;
}
const initialState: CredentialState = {
  credentials: {},
  addCredential: () => {
    return;
  }
};

export const CredentialContext = createContext<CredentialState>(initialState);

const useCredentials = () => useContext(CredentialContext);

const CredentialProvider = ({ children }: { children: React.ReactNode }) => {
  const [credentials, setCredentials] = useState({});

  useEffect(() => {
    const regex = RegExp(/credentials\[(.+)\]/);

    const types: string[] = Object.keys(localStorage)
      .map((key: string) => {
        const res = regex.exec(key);
        return res ? res[1] : '';
      })
      .filter((t) => t);

    const cred: { [type: string]: CredentialPayload[] } = {};
    for (const type of types) {
      cred[type] = findCredential(type);
    }

    setCredentials(cred);
  }, []);

  const findCredential = (type: string): CredentialPayload[] => {
    const _credentials = localStorage.getItem(`credentials[${type}]`);
    if (!_credentials) return [];

    const credentials = JSON.parse(_credentials) as CredentialPayload[];
    return credentials;
  };

  const addCredential = (credential: CredentialPayload) => {
    let type: string;
    if (typeof credential.type === 'string') {
      type = credential.type;
    } else {
      //filter all non generic types
      const types = credential.type.filter((t) => t !== 'VerifiableCredential');

      if (types.length == 0) {
        // ok, it's really generic :D
        type = 'VerifiableCredential';
      } else {
        type = types[0];
      }
    }

    setCredentials((oldCredentials: { [type: string]: CredentialPayload[] }) => {
      const credentials = oldCredentials[type] || [];
      credentials.push(credential);
      localStorage.setItem(`credentials[${type}]`, JSON.stringify(credentials));
      return {
        ...oldCredentials,
        type: credentials
      };
    });
  };

  return <CredentialContext.Provider value={{ credentials, addCredential }}>{children}</CredentialContext.Provider>;
};

export { CredentialProvider, useCredentials };
