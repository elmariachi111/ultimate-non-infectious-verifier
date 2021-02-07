import React, { useContext, createContext, useEffect } from 'react';
import { VerifiableCredential } from '@immu/core';

import { useState } from 'react';

export interface CredentialState {
  credentials: {
    [type: string]: VerifiableCredential[];
  };
  addCredential: (credential: VerifiableCredential) => void;
  lookupCredentials: (types: string[]) => VerifiableCredential[];
}
const initialState: CredentialState = {
  credentials: {},
  addCredential: () => {
    return;
  },
  lookupCredentials: () => {
    return [];
  }
};

export const CredentialContext = createContext<CredentialState>(initialState);

const useCredentials = () => useContext(CredentialContext);

const CredentialProvider = ({ children }: { children: React.ReactNode }) => {
  const [credentials, setCredentials] = useState<{ [type: string]: VerifiableCredential[] }>({});

  useEffect(() => {
    const regex = RegExp(/credentials\[(.+)\]/);

    const types: string[] = Object.keys(localStorage)
      .map((key: string) => {
        const res = regex.exec(key);
        return res ? res[1] : '';
      })
      .filter((t) => t);

    const cred: { [type: string]: VerifiableCredential[] } = {};
    for (const type of types) {
      cred[type] = findCredential(type);
    }

    setCredentials(cred);
  }, []);

  const findCredential = (type: string): VerifiableCredential[] => {
    const _credentials = localStorage.getItem(`credentials[${type}]`);
    if (!_credentials) return [];

    const credentials = JSON.parse(_credentials) as VerifiableCredential[];
    return credentials;
  };

  const lookupCredentials = (requestedSubjects: string[]): VerifiableCredential[] => {
    const weHaveTypes = Object.keys(credentials).filter((type) => requestedSubjects.includes(type));
    const ret = [];
    for (const type of weHaveTypes) {
      for (const cred of credentials[type]) {
        ret.push(cred);
      }
    }
    return ret;
  };

  function addCredential(credential: VerifiableCredential) {
    let type: string;
    if (typeof credential === 'string') throw Error('nooo');

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

    setCredentials((oldCredentials: { [type: string]: VerifiableCredential[] }) => {
      const credentials = oldCredentials[type] || [];
      credentials.push(credential);
      localStorage.setItem(`credentials[${type}]`, JSON.stringify(credentials));
      return {
        ...oldCredentials,
        type: credentials
      };
    });
  }

  return (
    <CredentialContext.Provider value={{ credentials, addCredential, lookupCredentials }}>
      {children}
    </CredentialContext.Provider>
  );
};

export { CredentialProvider, useCredentials };
