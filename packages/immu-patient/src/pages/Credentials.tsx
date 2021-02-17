import { Box, Divider, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { VerifiableCredential } from '@immu/core';
import { CredentialCard } from '@immu/frontend';
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
      <VStack spacing={4} mt={6} align="start">
        {Object.keys(credentials).map((k: string) => {
          return (
            <>
              <Heading size="sm">{k}</Heading>
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
            </>
          );
        })}
      </VStack>
    </>
  );
};

export default CredentialsPage;
