import { Box, Divider, Heading, VStack } from '@chakra-ui/react';
import { VerifiableCredential } from '@immu/core';
import { useCredentials } from 'hooks/CredentialStorage';
import CredentialCard from 'molecules/CredentialCard';
import AcceptCredentialOffer from 'organisms/AcceptCredentialOffer';
import React from 'react';

const CredentialsPage = () => {
  const { credentials } = useCredentials();

  return (
    <>
      <Box w="100%" mt={6}>
        <Heading size="lg">accept a new credential</Heading>
        <AcceptCredentialOffer />
      </Box>
      <Divider orientation="horizontal" my={8} />
      <VStack mt={6}>
        {Object.keys(credentials).map((k: string) => {
          return credentials[k].map((credential: VerifiableCredential) => {
            return <CredentialCard credential={credential} />;
          });
        })}
      </VStack>
    </>
  );
};

export default CredentialsPage;
