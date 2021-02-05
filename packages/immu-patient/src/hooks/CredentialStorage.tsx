import { CredentialPayload } from '@immu/core';
//import React from 'react';

export const useCredentialStorage = () => {
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

    const credentials = findCredential(type);
    credentials.push(credential);
    localStorage.setItem(`credentials[${type}]`, `[${JSON.stringify(credentials)}]`);
  };

  return { findCredential, addCredential };
};
