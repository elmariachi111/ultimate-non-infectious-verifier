import { Box, Text } from '@chakra-ui/react';
import { JWTVerified } from '@immu/core';
import { useCredentialStorage } from 'hooks/CredentialStorage';
//import { useIdentity } from 'context/IdentityContext';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RespondToPresentationRequest = ({ presentationRequest }: { presentationRequest: JWTVerified }) => {
  //  const { verifier } = useIdentity();
  const { findCredential } = useCredentialStorage();

  console.log(presentationRequest);
  const lookupCredentials = () => {
    const { requestedSubjects }: { requestedSubjects: string[] } = presentationRequest.payload;
    const foundCredentials = requestedSubjects.map(findCredential);
    console.log(foundCredentials);
  };

  lookupCredentials();

  return (
    <Box>
      <Text>huhu {presentationRequest.payload.requester}</Text>
    </Box>
  );
};

export default RespondToPresentationRequest;
