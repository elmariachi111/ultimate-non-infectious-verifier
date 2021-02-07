import { Box, Button, Code, Flex, Text, VStack } from '@chakra-ui/react';
import { Issuer, JWTVerified, VerifiableCredential } from '@immu/core';
import { useIdentity } from '@immu/frontend';
import { useCredentials } from 'hooks/CredentialStorage';
import CredentialCard from 'molecules/CredentialCard';
//import { useIdentity } from 'context/IdentityContext';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RespondToPresentationRequest = ({
  presentationRequest,
  cancel
}: {
  presentationRequest: JWTVerified;
  cancel: () => void;
}) => {
  const { account, resolver, did, verifier } = useIdentity();
  const { lookupCredentials } = useCredentials();

  console.log(presentationRequest);
  const { requestedSubjects } = presentationRequest.payload;

  const foundCredentials = lookupCredentials(requestedSubjects);
  console.log(foundCredentials);

  async function presentCredentials(credentialSelection: VerifiableCredential[]) {
    if (!(verifier && resolver && did && account)) {
      return;
    }

    const requesterDid = await resolver.resolve(presentationRequest.issuer);
    //todo: check that the presentation signature is valid.

    const issuer = new Issuer(resolver, did.id);
    const presentation = await issuer.createPresentation(credentialSelection);
    const presentationJwt = await issuer.createPresentationJwt(presentation, account.privateKey);

    console.log(presentationJwt);

    const presentationResponse = await fetch(presentationRequest.payload.callbackUrl, {
      method: 'POST',
      body: JSON.stringify({ presentationResponse: presentationJwt }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(presentationResponse);
  }

  return (
    <Box>
      <Box>
        <Code>{presentationRequest.issuer}</Code> asks you to disclose Credentials of type{' '}
        <Code>{requestedSubjects.join(',')}</Code>
      </Box>
      <Box>
        <Text>These credentials match the request:</Text>
        <VStack mt={6}>
          {foundCredentials.map((credential: VerifiableCredential) => (
            <CredentialCard credential={credential} />
          ))}
        </VStack>
      </Box>
      <Flex mt={6}>
        <Button colorScheme="red" onClick={() => presentCredentials(foundCredentials)}>
          Present these
        </Button>
        <Button colorScheme="teal" onClick={cancel}>
          Cancel
        </Button>
      </Flex>
    </Box>
  );
};

export default RespondToPresentationRequest;
