import { Box, Divider, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { VerifiableCredential } from '@univax/core';
import { CredentialCard } from '@univax/frontend';
import { SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import { useCredentials } from 'hooks/CredentialStorage';
import AcceptCredentialOffer from 'organisms/AcceptCredentialOffer';
import React from 'react';

const CredentialsPage = () => {
  const { credentials, removeCredential } = useCredentials();

  return (
    <>
      <Box w="100%" mt={6}>
        <Heading size="lg">accept a new credential</Heading>
        <AcceptCredentialOffer />
      </Box>
      <Divider orientation="horizontal" my={8} />
      <Heading size="lg">Your Credentials</Heading>

      {Object.keys(credentials).map((k: string, j) => {
        return (
          <Box key={`${k}-${j}`}>
            <Heading size="sm" mt={6}>
              {k}
            </Heading>
            <VStack spacing={4} align="start">
              {credentials[k].map((credential: VerifiableCredential, i) => (
                <SwipeableListItem
                  key={`c-${i}`}
                  swipeLeft={{
                    content: (
                      <Flex background="red.400" h="100%" w="100%" align="center" justify="flex-end">
                        <Text p={8} fontSize="xl" color="white">
                          remove
                        </Text>
                      </Flex>
                    ),

                    action: () => removeCredential(credential)
                  }}
                >
                  <CredentialCard credential={credential} />
                </SwipeableListItem>
              ))}
            </VStack>
          </Box>
        );
      })}
    </>
  );
};

export default CredentialsPage;
