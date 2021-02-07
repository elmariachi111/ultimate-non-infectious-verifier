import { Flex, Text } from '@chakra-ui/react';
import { CredentialPayload } from '@immu/core';
import React from 'react';

const CredentialCard = ({ credential }: { credential: CredentialPayload }) => {
  const bg = 'teal.200';

  function getRelevantTypes(): string[] {
    if (typeof credential.type === 'string') return [credential.type];
    else {
      return credential.type.filter((t) => t != 'VerifiableCredential');
    }
  }
  return (
    <Flex
      direction="column"
      justify="start"
      bg={bg}
      minHeight="3xs"
      minW="100%"
      maxW="lg"
      pt={4}
      borderRadius="lg"
      border="1px"
      borderBottom="4px solid"
      borderColor="teal.500"
      onClick={() => console.log(credential)}
    >
      {getRelevantTypes().map((type: string) => (
        <Text opacity={0.8} textAlign="center" bg="gray.200" py={4}>
          {type}
        </Text>
      ))}
    </Flex>
  );
};

export default CredentialCard;
