import { VStack } from '@chakra-ui/react';
import { CredentialPayload } from '@immu/core';
import { useCredentials } from 'hooks/CredentialStorage';
import CredentialCard from 'molecules/CredentialCard';
import React from 'react';

const CredentialsPage = () => {
  const { credentials } = useCredentials();

  return (
    <VStack>
      {Object.keys(credentials).map((k: string) => {
        return credentials[k].map((credential: CredentialPayload) => {
          return <CredentialCard credential={credential} />;
        });
      })}
    </VStack>
  );
};

export default CredentialsPage;
