import { Box, Text } from '@chakra-ui/react';
import { JWTVerified } from '@immu/core';
import { useCredentials } from 'hooks/CredentialStorage';
//import { useIdentity } from 'context/IdentityContext';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RespondToPresentationRequest = ({ presentationRequest }: { presentationRequest: JWTVerified }) => {
  //  const { verifier } = useIdentity();
  const { lookupCredentials } = useCredentials();

  console.log(presentationRequest);
  const { requestedSubjects } = presentationRequest.payload;

  const foundCredentials = lookupCredentials(requestedSubjects);
  console.log(foundCredentials);

  return (
    <Box>
      <Text>huhu {presentationRequest.payload.requester}</Text>
    </Box>
  );
};

export default RespondToPresentationRequest;
