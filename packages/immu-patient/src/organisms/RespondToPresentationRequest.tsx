import { Box, Text } from '@chakra-ui/react';
import { JWTVerified } from '@immu/core';
import { useCredentials } from 'hooks/CredentialStorage';
//import { useIdentity } from 'context/IdentityContext';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RespondToPresentationRequest = ({ presentationRequest }: { presentationRequest: JWTVerified }) => {
  //  const { verifier } = useIdentity();
  const { credentials } = useCredentials();

  console.log(presentationRequest);
  const lookupCredentials = () => {
    const { requestedSubjects }: { requestedSubjects: string[] } = presentationRequest.payload;
    const foundCredentials = Object.keys(credentials).map((type) => requestedSubjects.includes(type));
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
