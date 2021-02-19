import React, { useContext, createContext, useEffect } from 'react';
import { VerifiableCredential } from '@univax/core';

import { useState } from 'react';

export interface CredentialState {
  credentials: {
    [type: string]: VerifiableCredential[];
  };
  addCredential: (credential: VerifiableCredential) => void;
  removeCredential: (credential: VerifiableCredential) => void;
  lookupCredentials: (types: string[]) => VerifiableCredential[];
}
const initialState: CredentialState = {
  credentials: {},
  addCredential: () => {
    return;
  },
  removeCredential: () => {
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

  const getRelevantCredentialType = (credential: VerifiableCredential): string => {
    if (typeof credential === 'string') throw Error('nooo');
    if (typeof credential.type === 'string') {
      return credential.type;
    } else {
      //filter all non generic types
      const types = credential.type.filter((t) => t !== 'VerifiableCredential');

      if (types.length == 0) {
        // ok, it's really generic :D
        return 'VerifiableCredential';
      } else {
        return types[0];
      }
    }
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

  function removeCredential(credential: VerifiableCredential) {
    if (typeof credential === 'string') throw Error('nooo');

    const type = getRelevantCredentialType(credential);

    //the first find is a safety net, we can remove it
    const found = credentials[type].find((v) => v === credential);
    if (found) {
      setCredentials((oldCredentials: { [type: string]: VerifiableCredential[] }) => {
        const withoutCredential = oldCredentials[type].filter((v) => v !== credential);
        localStorage.setItem(`credentials[${type}]`, JSON.stringify(withoutCredential));
        return {
          ...oldCredentials,
          [type]: withoutCredential
        };
      });
    }
  }

  function addCredential(credential: VerifiableCredential) {
    if (typeof credential === 'string') throw Error('nooo');

    const type = getRelevantCredentialType(credential);

    setCredentials((oldCredentials: { [type: string]: VerifiableCredential[] }) => {
      const credentials = oldCredentials[type] || [];
      credentials.push(credential);
      localStorage.setItem(`credentials[${type}]`, JSON.stringify(credentials));
      const ret = {
        ...oldCredentials
      };
      ret[type] = credentials;
      return ret;
    });
  }

  return (
    <CredentialContext.Provider value={{ credentials, addCredential, lookupCredentials, removeCredential }}>
      {children}
    </CredentialContext.Provider>
  );
};

export { CredentialProvider, useCredentials };
