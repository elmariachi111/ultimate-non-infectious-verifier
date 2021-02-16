import { Box, Button, Divider, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { VerifiableCredential } from '@immu/core';
import { useCredentials } from 'hooks/CredentialStorage';
import { CredentialCard } from '@immu/frontend';
import AcceptCredentialOffer from 'organisms/AcceptCredentialOffer';
import React from 'react';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';

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
              {credentials[k].map((credential: VerifiableCredential) => (
                <SwipeableListItem
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
