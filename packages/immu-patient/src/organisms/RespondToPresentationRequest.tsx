import { Box, Button, Checkbox, Code, Flex, Radio, Text, VStack } from '@chakra-ui/react';
import { JWTVerified, VerifiableCredential } from '@immu/core';
import { CredentialCard, useIdentity } from '@immu/frontend';
import { useCredentials } from 'hooks/CredentialStorage';

import React, { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RespondToPresentationRequest = ({
  presentationRequest,
  cancel
}: {
  presentationRequest: JWTVerified;
  cancel: () => void;
}) => {
  const { account, resolver, issuer } = useIdentity();
  const { lookupCredentials } = useCredentials();
  const { requestedSubjects } = presentationRequest.payload;
  const foundCredentials = lookupCredentials(requestedSubjects);

  const [selectedCredentials, setSelectedCredentials] = useState<VerifiableCredential[]>(foundCredentials);

  async function presentCredentials(credentialSelection: VerifiableCredential[]) {
    const requesterDid = await resolver.resolve(presentationRequest.issuer);
    //todo: check that the presentation signature is valid.

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

  function toggleCredential(credential: VerifiableCredential) {
    setSelectedCredentials((old) =>
      old.includes(credential) ? old.filter((o) => o != credential) : [...old, credential]
    );
  }

  return (
    <Box>
      <Box my={4}>
        <Code>{presentationRequest.issuer}</Code> asks you to disclose Credentials of type{' '}
        <Code>{requestedSubjects.join(',')}</Code>
      </Box>
      <Box mt={4}>
        <Text>These credentials match the request:</Text>
        <VStack mt={6}>
          {foundCredentials.map((credential: VerifiableCredential, i) => (
            <Flex w="100%" key={`credential-${i}`}>
              <Checkbox
                size="lg"
                colorScheme="teal"
                mx={4}
                onChange={() => toggleCredential(credential)}
                isChecked={selectedCredentials.includes(credential)}
              ></Checkbox>
              <Box w="100%">
                <CredentialCard credential={credential} onSelect={toggleCredential} />
              </Box>
            </Flex>
          ))}
        </VStack>
      </Box>
      <Flex mt={6} justify="space-between">
        <Button colorScheme="green" onClick={() => presentCredentials(selectedCredentials)}>
          Present these
        </Button>
        <Button colorScheme="red" onClick={cancel}>
          Cancel
        </Button>
      </Flex>
    </Box>
  );
};

export default RespondToPresentationRequest;
