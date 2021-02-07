import React, { useContext, createContext, useEffect } from 'react';
import { CredentialPayload } from '@immu/core';

import { useState } from 'react';

export interface CredentialState {
  credentials: {
    [type: string]: CredentialPayload[];
  };
  addCredential: (credential: CredentialPayload) => void;
  lookupCredentials: (types: string[]) => CredentialPayload[];
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
  const [credentials, setCredentials] = useState<{ [type: string]: CredentialPayload[] }>({});

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

  const lookupCredentials = (requestedSubjects: string[]): CredentialPayload[] => {
    const weHaveTypes = Object.keys(credentials).filter((type) => requestedSubjects.includes(type));
    const ret = [];
    for (const type of weHaveTypes) {
      for (const cred of credentials[type]) {
        ret.push(cred);
      }
    }
    return ret;
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

  return (
    <CredentialContext.Provider value={{ credentials, addCredential, lookupCredentials }}>
      {children}
    </CredentialContext.Provider>
  );
};

export { CredentialProvider, useCredentials };
